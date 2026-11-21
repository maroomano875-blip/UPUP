// حفظ ملخص التحليل في السجل (خادم فقط). أي فشل هنا لا يُفشل التحليل نفسه.
import { getDB } from '../core/engine/db';
import { audit } from '../core/engine/audit';
import { buildSummary } from './analysisSummary';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function recordAnalysis(p: {
  userId: string | null; agentSlug: string; country: string; fileName?: string;
  result: Parameters<typeof buildSummary>[0];
}): Promise<void> {
  // بلا هوية موثّقة (بوابة معطّلة طارئاً) لا نحفظ شيئاً
  if (!p.userId || !UUID.test(p.userId)) return;
  try {
    const db = getDB();
    // المكتب (إن وُجد) يُقرأ من الخادم لا من المتصفح، فلا يمكن انتحاله
    const { data: m } = await db.from('office_members').select('office_id').eq('user_id', p.userId).maybeSingle();
    const summary = buildSummary(p.result, p.fileName);
    const { data, error } = await db.from('analysis_summaries')
      .insert({ office_id: m?.office_id ?? null, user_id: p.userId, agent_slug: p.agentSlug, country: p.country, summary })
      .select('id').single();
    if (error) throw error;
    await audit({ actor_id: p.userId, action: 'analysis.saved', resource_type: 'analysis_summary', resource_id: String(data.id), metadata: { agent: p.agentSlug, office: m?.office_id ?? null }, country: p.country });
  } catch (e) {
    console.error('[history] تعذّر حفظ الملخص:', e instanceof Error ? e.message : e);
  }
}
