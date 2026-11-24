// حالة المستخدم الحالية للإشعارات: هل التجربة مفعّلة عليه، وما حالة فرصه الثلاث (الهوية من رمز الجلسة الموثَّق)
import { NextRequest, NextResponse } from 'next/server';
import { extractBearer, verifyAccessUser } from '../../../lib/authGate';
import { isExempt } from '../../../lib/quota';
import { getDB } from '../../../core/engine/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const token = extractBearer(req.headers.get('authorization'));
  const user = base && anon && token ? await verifyAccessUser(base, anon, token) : null;
  if (!user) return NextResponse.json({ error: 'auth_required' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });

  const enforce = process.env.TRIAL_ENFORCE === 'on';
  const exempt = isExempt(user.email);
  if (!enforce || exempt) return NextResponse.json({ enforce, exempt, trial: null }, { headers: { 'Cache-Control': 'no-store' } });
  try {
    // مشترك بخطة فعّالة: لا إشعارات تجربة، ونرجع حالة استهلاك خطته
    const { data: pl } = await getDB().rpc('plan_status_for', { p_user: user.id });
    if ((pl as { has_plan?: boolean } | null)?.has_plan) return NextResponse.json({ enforce, exempt, trial: null, plan: pl }, { headers: { 'Cache-Control': 'no-store' } });
  } catch { /* نكمل لحالة التجربة */ }
  try {
    const { data, error } = await getDB().rpc('trial_status_for', { p_user: user.id });
    if (error) throw new Error(error.message);
    return NextResponse.json({ enforce, exempt, trial: data }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    console.error('[me] تعذّر قراءة حالة التجربة:', e instanceof Error ? e.message : e);
    return NextResponse.json({ enforce, exempt, trial: null, degraded: true }, { headers: { 'Cache-Control': 'no-store' } });
  }
}
