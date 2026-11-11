import { NextResponse } from 'next/server';
import { fetchRates } from '../../../lib/currency';

export const revalidate = 3600;

// أسعار استرشادية فقط للعملات المطلوبة (?codes=USD,SYP) مع تاريخ المصدر؛ فشل الجلب = ok:false
export async function GET(req: Request) {
  const codes = (new URL(req.url).searchParams.get('codes') || '').split(',').map((c) => c.trim().toLowerCase()).filter((c) => /^[a-z]{3}$/.test(c)).slice(0, 6);
  const r = await fetchRates();
  if (!r) return NextResponse.json({ ok: false }, { status: 200 });
  const usd: Record<string, number> = {};
  for (const c of codes) if (r.usd[c]) usd[c] = r.usd[c];
  return NextResponse.json({ ok: true, date: r.date, source: r.source, usd });
}
