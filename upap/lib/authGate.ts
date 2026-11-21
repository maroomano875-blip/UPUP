// بوابة الحساب: لا تحليل بلا مستخدم مسجَّل. منطق صرف قابل للاختبار (يعمل في Edge بلا مكتبات).
// نتحقق من رمز الجلسة عند Supabase نفسه (لا نثق بقراءة الرمز محلياً)، ونفشل مغلقاً عند أي شك.

export function extractBearer(header: string | null | undefined): string | null {
  const m = /^Bearer\s+([A-Za-z0-9._~+/=-]{20,4096})$/.exec((header ?? '').trim());
  return m ? m[1] : null;
}

type FetchLike = (url: string, init: { headers: Record<string, string> }) => Promise<{ ok: boolean; json: () => Promise<unknown> }>;

export type VerifiedUser = { id: string; email: string; provider: string };

// يرجع هوية المستخدم الموثَّقة (من Supabase نفسه) إن كان الرمز صالحاً، وإلا null (بما فيه أي عطل في الشبكة)
export async function verifyAccessUser(base: string, anonKey: string, token: string, f: FetchLike = fetch as unknown as FetchLike): Promise<VerifiedUser | null> {
  try {
    const r = await f(`${base.replace(/\/+$/, '')}/auth/v1/user`, { headers: { apikey: anonKey, Authorization: `Bearer ${token}` } });
    if (!r.ok) return null;
    const u = (await r.json()) as { id?: unknown; email?: unknown; app_metadata?: { provider?: unknown } };
    if (typeof u.id !== 'string' || u.id.length < 8) return null;
    return {
      id: u.id,
      email: typeof u.email === 'string' ? u.email.trim().toLowerCase() : '',
      provider: typeof u.app_metadata?.provider === 'string' ? u.app_metadata.provider : 'unknown',
    };
  } catch {
    return null;
  }
}

// يرجع معرّف المستخدم فقط (للتوافق مع الاستعمالات القديمة)
export async function verifyAccessToken(base: string, anonKey: string, token: string, f: FetchLike = fetch as unknown as FetchLike): Promise<string | null> {
  return (await verifyAccessUser(base, anonKey, token, f))?.id ?? null;
}
