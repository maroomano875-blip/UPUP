import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// سجل الطلبات الأخيرة. قراءة آمنة: أي خطأ ← قائمة فارغة.
export async function GET(req: Request) {
  const slugs = (new URL(req.url).searchParams.get('agents') || '').split(',').filter(Boolean);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ connected: false, rows: [] });
  try {
    const db = createClient(url, key, { auth: { persistSession: false } });
    const au = await db.from('audit_log').select('*').order('created_at', { ascending: false }).limit(16);
    const skip = new Set(['id', 'created_at', 'request_id', 'client_id', 'event', 'action', 'type']);
    const audit = (au.data ?? []).map((r: Record<string, unknown>) => ({
      at: String(r.created_at ?? ''),
      event: String(r.event ?? r.action ?? r.type ?? ''),
      detail: JSON.stringify(Object.fromEntries(Object.entries(r).filter(([k, v]) => !skip.has(k) && v != null))).slice(0, 260),
    }));
    const { data, error } = await db.from('requests').select('*').order('created_at', { ascending: false }).limit(60);
    if (error) return NextResponse.json({ connected: false, rows: [] });
    const rows = (data ?? [])
      .filter((r: Record<string, unknown>) => {
        if (!slugs.length) return true;
        const s = String(r.agent_slug ?? r.agent ?? r.agent_id ?? '');
        return !s || slugs.some((x) => s.includes(x));
      })
      .slice(0, 25)
      .map((r: Record<string, unknown>) => ({
        id: String(r.id ?? ''),
        status: String(r.status ?? ''),
        agent: String(r.agent_slug ?? r.agent ?? r.agent_id ?? ''),
        country: String(r.country ?? ''),
        confidence: typeof r.confidence_score === 'number' ? r.confidence_score : null,
        created_at: String(r.created_at ?? ''),
      }));
    return NextResponse.json({ connected: true, rows, audit });
  } catch {
    return NextResponse.json({ connected: false, rows: [] });
  }
}
