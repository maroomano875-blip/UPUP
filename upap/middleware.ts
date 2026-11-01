import { NextRequest, NextResponse } from 'next/server';

// حدّ استخدام يحمي الحصة المجانية: لكل جهاز في الساعة + سقف يومي عام.
// يعمل على POST /api/agents/* فقط. عند أي عطل في قاعدة البيانات يسمح بالطلب (fail-open).
export const config = { matcher: ['/api/agents/:path*'] };

const PER_HOUR = Number(process.env.RATE_LIMIT_HOUR ?? 8);
const PER_DAY_GLOBAL = Number(process.env.RATE_LIMIT_DAY_GLOBAL ?? 200);

async function sha(s: string): Promise<string> {
  const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(h)).map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 24);
}

export async function middleware(req: NextRequest) {
  if (req.method !== 'POST') return NextResponse.next();
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !key) return NextResponse.next();

  const h = { apikey: key, Authorization: `Bearer ${key}` };
  const ip = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown').split(',')[0].trim();
  const who = 'ip:' + (await sha(ip));
  const hourAgo = new Date(Date.now() - 3600_000).toISOString();
  const dayAgo = new Date(Date.now() - 86_400_000).toISOString();

  const count = async (q: string): Promise<number> => {
    const r = await fetch(`${base}/rest/v1/rate_hits?select=id&${q}`, { headers: { ...h, Prefer: 'count=exact', Range: '0-0' } });
    const m = /\/(\d+)$/.exec(r.headers.get('content-range') || '');
    return m ? Number(m[1]) : 0;
  };

  try {
    const [mine, all] = await Promise.all([
      count(`key=eq.${who}&at=gte.${hourAgo}`),
      count(`at=gte.${dayAgo}`),
    ]);
    if (mine >= PER_HOUR) {
      return NextResponse.json({ error: `بلغت الحد المسموح (${PER_HOUR} تحليلات في الساعة) لحماية الخدمة المجانية. جرّب بعد قليل، أو استخدم «المثال الجاهز» لرؤية شكل النتيجة فوراً.` }, { status: 429 });
    }
    if (all >= PER_DAY_GLOBAL) {
      return NextResponse.json({ error: 'بلغت الخدمة المجانية سقفها اليومي. جرّب غداً، أو استخدم «المثال الجاهز» لرؤية شكل النتيجة فوراً.' }, { status: 429 });
    }
    await fetch(`${base}/rest/v1/rate_hits`, { method: 'POST', headers: { ...h, 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify({ key: who }) });
    if (Math.random() < 0.02) {
      const old = new Date(Date.now() - 2 * 86_400_000).toISOString();
      await fetch(`${base}/rest/v1/rate_hits?at=lt.${old}`, { method: 'DELETE', headers: h });
    }
  } catch { /* عطل في العدّاد: لا نمنع المستخدم */ }
  return NextResponse.next();
}
