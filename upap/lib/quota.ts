// حصص التجربة المجانية (خادم فقط). التطبيق يُفعَّل بـ TRIAL_ENFORCE=on، ويُستثنى أصحاب TRIAL_EXEMPT_EMAILS.
// أي عطل في قاعدة البيانات يمنع التحليل (فشل مغلق) لأن الحد يجب ألا يُتجاوز.
import { getDB } from '../core/engine/db';
import { identityKey, isAllowedEmailDomain } from './authPolicy';

export type QuotaResult =
  | { ok: true; eventId?: number }
  | { ok: false; status: number; code: string; nextAt?: string };

export const isExempt = (email: string, list: string | undefined = process.env.TRIAL_EXEMPT_EMAILS) =>
  !!email && (list ?? '').split(',').map((x) => x.trim().toLowerCase()).filter(Boolean).includes(email.trim().toLowerCase());

// المنطقة الزمنية IANA من المتصفح؛ أي قيمة غير صالحة تصبح UTC
export function cleanTimeZone(raw: unknown): string {
  if (typeof raw !== 'string' || raw.length > 64) return 'UTC';
  try { new Intl.DateTimeFormat('en', { timeZone: raw }); return raw; } catch { return 'UTC'; }
}

type RpcDb = { rpc: (fn: string, args: Record<string, unknown>) => PromiseLike<{ data: unknown; error: { message: string } | null }> };

export async function consumeQuota(
  u: { userId: string | null; email: string; provider: string; tz: string; agent: string },
  opts: { enforce?: boolean; db?: RpcDb } = {},
): Promise<QuotaResult> {
  const enforce = opts.enforce ?? process.env.TRIAL_ENFORCE === 'on';
  if (!enforce || !u.userId) return { ok: true };
  if (isExempt(u.email)) return { ok: true };
  // الدخول بالبريد يُقبل من النطاقات المعروفة فقط (Google مستثنى: هويته موثّقة عند مزوّدها)
  if (u.provider === 'email' && !isAllowedEmailDomain(u.email)) return { ok: false, status: 403, code: 'email_domain' };
  try {
    const db = opts.db ?? (getDB() as unknown as RpcDb);
    const { data, error } = await db.rpc('consume_trial', {
      p_user: u.userId, p_tz: u.tz, p_provider: u.provider, p_identity: u.email ? identityKey(u.email) : null, p_agent: u.agent,
    });
    if (error) throw new Error(error.message);
    const r = data as { ok?: boolean; reason?: string; event_id?: number; next_at?: string };
    if (r?.ok) return { ok: true, eventId: r.event_id };
    const code = r?.reason ?? 'quota_unavailable';
    return { ok: false, status: code === 'trial_daily_used' ? 429 : 403, code, nextAt: r?.next_at };
  } catch (e) {
    console.error('[quota] تعذّر فحص الحصة:', e instanceof Error ? e.message : e);
    return { ok: false, status: 503, code: 'quota_unavailable' };
  }
}

export async function refundQuota(eventId: number | undefined, userId: string | null, db?: RpcDb): Promise<void> {
  if (!eventId || !userId) return;
  try { await (db ?? (getDB() as unknown as RpcDb)).rpc('refund_trial', { p_event: eventId, p_user: userId }); }
  catch (e) { console.error('[quota] تعذّر الاسترجاع:', e instanceof Error ? e.message : e); }
}
