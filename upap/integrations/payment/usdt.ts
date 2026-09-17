// ==========================================================
// معالج الدفع بـ USDT (TRC20) عبر TronGrid API — مجاني
// الفكرة: كل عميل يرسل مبلغاً فريداً بالسنتات كـ"بصمة"
// مثال: سعر الاشتراك $9 → العميل أ: $9.01 | العميل ب: $9.03
// ==========================================================
import { getDB } from "../../core/engine/db";
import { audit } from "../../core/engine/audit";

const WALLET = process.env.USDT_WALLET_ADDRESS ?? "";
const TRON_NODE = process.env.TRON_FULL_NODE ?? "https://api.trongrid.io";
const TRON_KEY = process.env.TRON_API_KEY ?? "";

// عنوان عقد USDT-TRC20 على الشبكة الرئيسية
const USDT_CONTRACT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";

interface TronTransaction {
  transaction_id: string;
  from: string;
  to: string;
  value: number;        // بالـ sun (1 USDT = 1,000,000 sun)
  block_timestamp: number;
}

// جلب آخر 50 معاملة USDT واردة إلى المحفظة
export async function fetchRecentIncoming(): Promise<TronTransaction[]> {
  const url = `${TRON_NODE}/v1/accounts/${WALLET}/transactions/trc20` +
    `?contract_address=${USDT_CONTRACT}&limit=50&only_to=true`;

  const res = await fetch(url, {
    headers: TRON_KEY ? { "TRON-PRO-API-KEY": TRON_KEY } : {},
  });

  if (!res.ok) throw new Error(`TronGrid خطأ ${res.status}`);
  const data = await res.json();
  return (data.data ?? []).map((tx: Record<string, unknown>) => ({
    transaction_id: tx.transaction_id as string,
    from: (tx.from as string),
    to: (tx.to as string),
    value: Number((tx.value as string) ?? 0),
    block_timestamp: tx.block_timestamp as number,
  }));
}

// مطابقة مبلغ مع اشتراك معلّق في قاعدة البيانات
export async function processIncomingPayments(): Promise<void> {
  const db = getDB();
  const txList = await fetchRecentIncoming();

  for (const tx of txList) {
    const usdtAmount = tx.value / 1_000_000; // تحويل من sun إلى USDT

    // هل هذه المعاملة معالجة مسبقاً؟
    const { data: existing } = await db
      .from("subscriptions")
      .select("id")
      .eq("payment_tx_id", tx.transaction_id)
      .single();
    if (existing) continue;

    // البحث عن اشتراك معلّق بنفس المبلغ (مع هامش ±0.005 USDT)
    const { data: pendingSub } = await db
      .from("subscriptions")
      .select("id, client_id, plan, agents_included")
      .eq("status", "pending")
      .gte("price_usd", usdtAmount - 0.005)
      .lte("price_usd", usdtAmount + 0.005)
      .order("created_at", { ascending: true })
      .limit(1)
      .single();

    if (!pendingSub) continue;

    // تفعيل الاشتراك
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    await db.from("subscriptions").update({
      status: "active",
      payment_tx_id: tx.transaction_id,
      started_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    }).eq("id", pendingSub.id);

    await db.from("clients").update({
      plan: pendingSub.plan,
      plan_expires_at: expiresAt.toISOString(),
    }).eq("id", pendingSub.client_id);

    await audit({
      actor_id: pendingSub.client_id,
      action: "subscription.activated",
      resource_type: "subscription",
      resource_id: pendingSub.id,
      metadata: { tx_id: tx.transaction_id, amount_usdt: usdtAmount },
    });

    console.log(`✅ اشتراك مفعَّل: ${pendingSub.client_id} | ${usdtAmount} USDT | ${tx.transaction_id}`);
  }
}
