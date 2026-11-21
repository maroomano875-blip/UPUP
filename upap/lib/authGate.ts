// بوابة الحساب: لا تحليل بلا مستخدم مسجَّل. منطق صرف قابل للاختبار (يعمل في Edge بلا مكتبات).
// نتحقق من رمز الجلسة عند Supabase نفسه (لا نثق بقراءة الرمز محلياً)، ونفشل مغلقاً عند أي شك.

export function extractBearer(header: string | null | undefined): string | null {
  const m = /^Bearer\s+([A-Za-z0-9._~+/=-]{20,4096})$/.exec((header ?? '').trim());
  return m ? m[1] : null;
}

type FetchLike = (url: string, init: { headers: Record<string, string> }) => Promise<{ ok: boolean; json: () => Promise<unknown> }>;

// يرجع معرّف المستخدم إن كان الرمز صالحاً، وإلا null (بما فيه أي عطل في الشبكة)
export async function verifyAccessToken(base: string, anonKey: string, token: string, f: FetchLike = fetch as unknown as FetchLike): Promise<string | null> {
  try {
    const r = await f(`${base.replace(/\/+$/, '')}/auth/v1/user`, { headers: { apikey: anonKey, Authorization: `Bearer ${token}` } });
    if (!r.ok) return null;
    const u = (await r.json()) as { id?: unknown };
    return typeof u.id === 'string' && u.id.length >= 8 ? u.id : null;
  } catch {
    return null;
  }
}
