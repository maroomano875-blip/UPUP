import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// مهمة يومية: تُبقي مشروع Supabase نشطاً وتنظّف سجلات الحد القديمة.
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ ok: false, reason: 'env' });
  try {
    const db = createClient(url, key, {
      auth: { persistSession: false },
      global: { fetch: (u: RequestInfo | URL, i?: RequestInit) => fetch(u, { ...i, cache: 'no-store' }) },
    });
    const old = new Date(Date.now() - 2 * 86_400_000).toISOString();
    await db.from('rate_hits').delete().lt('at', old);
    const { count, error } = await db.from('audit_log').select('*', { count: 'exact', head: true });
    if (error) return NextResponse.json({ ok: false });
    return NextResponse.json({ ok: true, audit_rows: count });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
