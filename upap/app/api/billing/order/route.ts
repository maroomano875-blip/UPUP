// شراء الاشتراك: POST ينشئ طلباً بمبلغ فريد، وGET يفحص حالته (يفعّل الاشتراك تلقائياً عند وصول الدفعة).
// الهوية دائماً من رمز الجلسة الموثَّق، لا من الجسم.
import { NextRequest, NextResponse } from 'next/server';
import { extractBearer, verifyAccessUser } from '../../../../lib/authGate';
import { hit } from '../../../../lib/rateLimit';
import { checkOrder, createOrder, orderErrorCode } from '../../../../lib/billing';

export const dynamic = 'force-dynamic';
const H = { 'Cache-Control': 'no-store' };
const PLANS = ['individual', 'small', 'medium', 'large'];
const PERIODS = ['weekly', 'monthly', 'yearly'];

async function who(req: NextRequest) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const token = extractBearer(req.headers.get('authorization'));
  return base && anon && token ? verifyAccessUser(base, anon, token) : null;
}

const fail = (e: unknown) => {
  const msg = e instanceof Error ? e.message : '';
  console.error('[billing]', msg);
  if (msg.includes('wallet_missing')) return NextResponse.json({ error: 'wallet_missing' }, { status: 503, headers: H });
  if (msg.includes('tron_unavailable')) return NextResponse.json({ error: 'tron_unavailable' }, { status: 502, headers: H });
  const code = orderErrorCode(msg);
  return NextResponse.json({ error: code }, { status: code === 'generic' ? 500 : 400, headers: H });
};

export async function POST(req: NextRequest) {
  const user = await who(req);
  if (!user) return NextResponse.json({ error: 'auth_required' }, { status: 401, headers: H });
  if (!hit('order:' + user.id, 10, 60_000)) return NextResponse.json({ error: 'rate_limited' }, { status: 429, headers: { ...H, 'Retry-After': '60' } });
  const body = (await req.json().catch(() => ({}))) as { plan?: unknown; period?: unknown };
  if (typeof body.plan !== 'string' || !PLANS.includes(body.plan) || typeof body.period !== 'string' || !PERIODS.includes(body.period)) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400, headers: H });
  }
  try { return NextResponse.json(await createOrder(user.id, body.plan, body.period), { headers: H }); } catch (e) { return fail(e); }
}

export async function GET(req: NextRequest) {
  const user = await who(req);
  if (!user) return NextResponse.json({ error: 'auth_required' }, { status: 401, headers: H });
  const id = req.nextUrl.searchParams.get('id') ?? '';
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: 'invalid_request' }, { status: 400, headers: H });
  try {
    const st = await checkOrder(user.id, id);
    return st ? NextResponse.json(st, { headers: H }) : NextResponse.json({ error: 'not_found' }, { status: 404, headers: H });
  } catch (e) { return fail(e); }
}
