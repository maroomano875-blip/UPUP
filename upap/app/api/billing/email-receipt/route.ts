// يرسل بريد تأكيد الاشتراك لإشعارات المستخدم «subscribed» (مرة واحدة لكل إشعار، ويُسجَّل في سجل التدقيق).
import { NextRequest, NextResponse } from 'next/server';
import { extractBearer, verifyAccessUser } from '../../../../lib/authGate';
import { getDB } from '../../../../core/engine/db';
import { sendMail } from '../../../../lib/mailer';
import { receiptMail, safeLang } from '../../../../lib/receiptEmail';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
const H = { 'Cache-Control': 'no-store' };
const UUID = /^[0-9a-f-]{36}$/i;

export async function POST(req: NextRequest) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const token = extractBearer(req.headers.get('authorization'));
  const user = base && anon && token ? await verifyAccessUser(base, anon, token) : null;
  if (!user || !user.email) return NextResponse.json({ error: 'auth_required' }, { status: 401, headers: H });

  const body = (await req.json().catch(() => ({}))) as { ids?: unknown; lang?: unknown };
  const ids = Array.isArray(body.ids) ? body.ids.filter((x): x is string => typeof x === 'string' && UUID.test(x)).slice(0, 5) : [];
  if (!ids.length) return NextResponse.json({ sent: 0 }, { headers: H });

  const db = getDB();
  const { data } = await db.from('notifications').select('id,kind,meta').eq('user_id', user.id).eq('kind', 'subscribed').in('id', ids);
  const rows = (data ?? []) as { id: string; meta: { plan?: string; period?: string; expires_at?: string } | null }[];
  let sent = 0;
  for (const r of rows) {
    const { data: done } = await db.from('billing_audit').select('id').eq('user_id', user.id).eq('action', 'email_sent').eq('meta->>notification_id', r.id).limit(1).maybeSingle();
    if (done) continue;
    const m = receiptMail(user.email, safeLang(body.lang), r.meta?.plan ?? '', r.meta?.period ?? '', r.meta?.expires_at ?? '');
    const res = await sendMail(m);
    if (res === 'not_configured') return NextResponse.json({ sent, reason: 'not_configured' }, { headers: H });
    await db.from('billing_audit').insert({ order_id: null, user_id: user.id, action: res === 'sent' ? 'email_sent' : 'email_failed', meta: { notification_id: r.id } }).then(() => null, () => null);
    if (res === 'sent') sent++;
  }
  return NextResponse.json({ sent }, { headers: H });
}
