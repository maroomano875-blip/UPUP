import { createClient } from '@supabase/supabase-js';

export interface Stats { requests: number | null; audits: number | null; recent: Record<string, unknown>[]; connected: boolean }

// قراءة آمنة: أي خطأ ← أرقام فارغة وليس انهيار الصفحة.
export async function loadStats(): Promise<Stats> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { requests: null, audits: null, recent: [], connected: false };
  try {
    const db = createClient(url, key, { auth: { persistSession: false } });
    const [r, a, recent] = await Promise.all([
      db.from('requests').select('*', { count: 'exact', head: true }),
      db.from('audit_log').select('*', { count: 'exact', head: true }),
      db.from('audit_log').select('*').order('created_at', { ascending: false }).limit(8),
    ]);
    return { requests: r.count ?? 0, audits: a.count ?? 0, recent: (recent.data as Record<string, unknown>[]) ?? [], connected: !r.error };
  } catch {
    return { requests: null, audits: null, recent: [], connected: false };
  }
}
