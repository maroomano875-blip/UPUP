// شراء الاشتراك: إنشاء طلب بمبلغ فريد، والتحقق التلقائي من وصول الدفعة ثم التفعيل (خادم فقط، بمفتاح الخدمة).
import { getDB } from '../core/engine/db';
import { fetchIncoming, findMatchingTransfer, isTronAddress } from './tron';

export type OrderState =
  | { status: 'pending'; orderId: string; amount: number; address: string; expiresAt: string }
  | { status: 'paid'; orderId: string; plan: string; period: string; expiresAt: string | null }
  | { status: 'expired'; orderId: string };

type Row = { id: string; user_id: string | null; plan_code: string; period: string; amount_usdt: number | string; status: string; created_at: string; expires_at: string };
const GRACE_MS = 30 * 60 * 1000; // نتحقق من الدفعة حتى نصف ساعة بعد الانتهاء إن كانت العملية سُجّلت قبله

export const walletAddress = () => {
  const w = (process.env.USDT_WALLET_ADDRESS ?? '').trim();
  return isTronAddress(w) ? w : null;
};

// أخطاء قاعدة البيانات المعروفة تتحول لرموز قصيرة تعرضها الواجهة
const KNOWN = ['invalid_plan', 'invalid_period', 'price_missing', 'office_owner_required', 'in_office', 'too_many_orders', 'amount_busy', 'already_subscribed'];
export const orderErrorCode = (msg: string | undefined) => KNOWN.find((k) => (msg ?? '').includes(k)) ?? 'generic';

async function audit(orderId: string | null, userId: string, action: string, meta: Record<string, unknown>) {
  try { await getDB().from('billing_audit').insert({ order_id: orderId, user_id: userId, action, meta }); } catch { /* التدقيق لا يوقف الطلب */ }
}

export async function checkOrder(userId: string, orderId: string): Promise<OrderState | null> {
  const db = getDB();
  const { data, error } = await db.from('payment_orders')
    .select('id,user_id,plan_code,period,amount_usdt,status,created_at,expires_at').eq('id', orderId).eq('user_id', userId).maybeSingle();
  if (error) throw new Error(error.message);
  const o = data as Row | null;
  if (!o) return null;
  const wallet = walletAddress();
  const expMs = Date.parse(o.expires_at);

  if (o.status === 'paid') {
    const { data: s } = await db.rpc('activate_payment', { p_order: o.id, p_tx: 'already-paid-check' }).then((r) => r, () => ({ data: null }));
    const row = Array.isArray(s) ? s[0] : null;
    return { status: 'paid', orderId: o.id, plan: o.plan_code, period: o.period, expiresAt: row?.expires_at ?? null };
  }
  if (o.status !== 'pending' || Date.now() > expMs + GRACE_MS) return { status: 'expired', orderId: o.id };
  if (!wallet) throw new Error('wallet_missing');

  const list = await fetchIncoming(wallet, process.env.TRON_API_KEY);
  const hit = findMatchingTransfer(list, { wallet, amount: o.amount_usdt, fromMs: Date.parse(o.created_at) - 60_000, toMs: expMs });
  if (hit) {
    const { data: act, error: e2 } = await db.rpc('activate_payment', { p_order: o.id, p_tx: hit.transaction_id });
    if (e2) throw new Error(e2.message);
    const row = Array.isArray(act) ? act[0] : null;
    return { status: 'paid', orderId: o.id, plan: o.plan_code, period: o.period, expiresAt: row?.expires_at ?? null };
  }
  if (Date.now() > expMs) return { status: 'expired', orderId: o.id };
  return { status: 'pending', orderId: o.id, amount: Number(o.amount_usdt), address: wallet, expiresAt: o.expires_at };
}

// ينشئ طلباً جديداً. قبل ذلك نفحص آخر طلب معلّق للمستخدم حتى لا تضيع دفعة وصلت للتو.
export async function createOrder(userId: string, plan: string, period: string): Promise<OrderState> {
  const wallet = walletAddress();
  if (!wallet) throw new Error('wallet_missing');
  const db = getDB();
  // لا يُباع نفس الخطة بنفس المدة وهي فعّالة؛ المدد الأخرى والخطط الأخرى تبقى مفتوحة
  const now = new Date().toISOString();
  const { data: mem } = await db.from('office_members').select('office_id').eq('user_id', userId).limit(1).maybeSingle();
  const officeId = (mem as { office_id: string } | null)?.office_id;
  const act = officeId
    ? await db.from('office_subscriptions').select('id').eq('office_id', officeId).eq('plan_code', plan).eq('period', period).eq('status', 'active').gt('expires_at', now).limit(1).maybeSingle()
    : await db.from('user_subscriptions').select('id').eq('user_id', userId).eq('plan_code', plan).eq('period', period).eq('status', 'active').gt('expires_at', now).limit(1).maybeSingle();
  if (act.data) throw new Error('already_subscribed');
  const { data: last } = await db.from('payment_orders').select('id').eq('user_id', userId).eq('status', 'pending')
    .order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (last) {
    const st = await checkOrder(userId, (last as { id: string }).id).catch(() => null);
    if (st?.status === 'paid') return st;
  }
  // إن كان للمستخدم طلب معلّق صالح لنفس الخطة والمدة نُعيده بدل إنشاء طلب جديد (يمنع تراكم الطلبات عند فتح النافذة مراراً)
  const { data: same } = await db.from('payment_orders').select('id,amount_usdt,expires_at').eq('user_id', userId).eq('status', 'pending')
    .eq('plan_code', plan).eq('period', period).gt('expires_at', new Date().toISOString()).order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (same) {
    const r = same as { id: string; amount_usdt: number | string; expires_at: string };
    return { status: 'pending', orderId: r.id, amount: Number(r.amount_usdt), address: wallet, expiresAt: r.expires_at };
  }
  const { data, error } = await db.rpc('create_payment_order', { p_user: userId, p_plan: plan, p_period: period });
  if (error) throw new Error(error.message);
  const r = Array.isArray(data) ? data[0] : null;
  if (!r) throw new Error('generic');
  await audit(r.order_id, userId, 'order_created', { plan, period, amount: r.amount_usdt });
  return { status: 'pending', orderId: r.order_id, amount: Number(r.amount_usdt), address: wallet, expiresAt: r.expires_at };
}
