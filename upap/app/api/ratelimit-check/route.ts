import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// أداة تشخيص مؤقتة: تختبر اتصال عدّاد الحماية بقاعدة البيانات وتعرض الأخطاء. احذفها بعد الفحص.
export async function GET() {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const out: Record<string, unknown> = { hasUrl: !!base, hasKey: !!key, keyStartsWith: key ? key.slice(0, 5) : null };
  if (!base || !key) return NextResponse.json(out);
  const h: Record<string, string> = key.startsWith('eyJ') ? { apikey: key, Authorization: `Bearer ${key}` } : { apikey: key };
  try {
    const c = await fetch(`${base}/rest/v1/rate_hits?select=id`, { headers: { ...h, Prefer: 'count=exact', Range: '0-0' } });
    out.count = { status: c.status, range: c.headers.get('content-range'), body: (await c.text()).slice(0, 200) };
    const i = await fetch(`${base}/rest/v1/rate_hits`, { method: 'POST', headers: { ...h, 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify({ key: 'diag' }) });
    out.insert = { status: i.status, body: (await i.text()).slice(0, 200) };
  } catch (e) { out.error = String(e).slice(0, 200); }
  return NextResponse.json(out);
}
