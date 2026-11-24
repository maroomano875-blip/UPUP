// مهمة يومية: تحذف ملخصات التحليل التي انتهت مدتها (30 يوماً). ‎?dry=1‎ يعدّ دون حذف.
// إن ضُبط CRON_SECRET في Vercel فالمهمة المجدولة تُرسله تلقائياً ويُرفض أي طلب بدونه.
import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '../../../core/engine/db';
import { audit } from '../../../core/engine/audit';
import { purgeExpiredSummaries, type PurgeDb } from '../../../lib/purgeSummaries';

export const dynamic = 'force-dynamic';
const H = { 'Cache-Control': 'no-store' };

export async function GET(req: NextRequest) {
  const secret = (process.env.CRON_SECRET ?? '').trim();
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401, headers: H });
  }
  const dry = req.nextUrl.searchParams.get('dry') === '1';
  try {
    const r = await purgeExpiredSummaries(getDB() as unknown as PurgeDb, { dry });
    if (!r.ok) {
      console.error('[cleanup]', r.error);
      return NextResponse.json({ ok: false }, { status: 500, headers: H });
    }
    if (!dry && r.count > 0) {
      await audit({ action: 'summaries.purged', resource_type: 'analysis_summaries', resource_id: 'expired', metadata: { count: r.count } });
    }
    return NextResponse.json({ ok: true, dry: r.dry, count: r.count }, { headers: H });
  } catch (e) {
    console.error('[cleanup]', e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false }, { status: 500, headers: H });
  }
}
