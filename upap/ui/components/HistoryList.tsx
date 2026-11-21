'use client';
// سجل ملخصات التحاليل (آخر 30 يوماً). الصلاحيات تفرضها RLS: العضو يرى تحاليله، والمشرف/المالك يرون كل المكتب.
import { useEffect, useState } from 'react';
import { useI18n } from './I18nProvider';
import { getBrowserSupabase } from '../../lib/supabaseBrowser';
import { liveAgents } from '../../data/catalog';
import { agentName } from '../../lib/i18n/catalog';
import type { AnalysisSummary } from '../../lib/analysisSummary';

type Row = { id: string; user_id: string; agent_slug: string; country: string | null; summary: AnalysisSummary; created_at: string };
const PAGE = 10;

export default function HistoryList({ uid, emails }: { uid: string; emails: Record<string, string> }) {
  const { t, lang } = useI18n();
  const sb = getBrowserSupabase();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [limit, setLimit] = useState(PAGE);

  useEffect(() => {
    if (!sb) return;
    let off = false;
    sb.from('analysis_summaries')
      .select('id, user_id, agent_slug, country, summary, created_at')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(limit + 1)
      .then(({ data }) => { if (!off) setRows((data as Row[] | null) ?? []); });
    return () => { off = true; };
  }, [sb, limit]);

  const agents = liveAgents();
  const nameOf = (slug: string) => { const a = agents.find((x) => x.slug === slug); return a ? agentName(a, lang) : slug; };
  const when = (iso: string) => new Date(iso).toLocaleString(lang, { dateStyle: 'medium', timeStyle: 'short' });
  const countText = (s: AnalysisSummary) => {
    const c = s.counts ?? {};
    return (['items', 'sections', 'tests', 'clauses'] as const).filter((k) => c[k] != null).map((k) => t(`history.${k}` as never, { n: c[k] as number })).join(' · ');
  };

  const shown = (rows ?? []).slice(0, limit);
  return (
    <div>
      <h2 className="mb-1 text-sm font-bold text-[#cbd5e1]">{t('history.title')}</h2>
      <p className="mb-2 text-xs text-[#64748b]">{t('history.note')}</p>
      {rows === null && <div className="h-16 animate-pulse rounded-xl bg-[rgba(255,255,255,0.06)]" aria-hidden />}
      {rows && rows.length === 0 && <p className="text-sm leading-7 text-[#94a3b8]">{t('history.empty')}</p>}
      <ul className="space-y-2">
        {shown.map((r, i) => (
          <li key={r.id} style={{ animationDelay: `${i * 50}ms` }} className="fx-rise rounded-xl bg-[rgba(2,6,23,0.55)] px-3 py-2.5 text-sm">
            <div className="flex items-start justify-between gap-2">
              <span className="font-semibold text-[#f1f5f9]">{nameOf(r.agent_slug)}{r.country ? ` · ${r.country}` : ''}</span>
              <span className="shrink-0 text-xs text-[#94a3b8]">{when(r.created_at)}</span>
            </div>
            <div className="mt-1 text-xs leading-6 text-[#94a3b8]">
              {[r.summary.doc_type, r.summary.party, r.summary.total ? `${r.summary.total} ${r.summary.currency ?? ''}`.trim() : '', countText(r.summary)].filter(Boolean).join(' · ')}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-[#64748b]">
              <span>{t('history.confidence', { n: Math.round((r.summary.confidence ?? 0) * 100) })}</span>
              {r.summary.needs_review && <span className="text-[#fcd34d]">{t('history.review')}</span>}
              {(emails[r.user_id] || r.user_id === uid) && <span dir="ltr">{r.user_id === uid ? t('history.mine') : emails[r.user_id]}</span>}
            </div>
          </li>
        ))}
      </ul>
      {rows && rows.length > limit && (
        <button onClick={() => setLimit((n) => n + PAGE)} className="fx-press mt-3 text-xs font-semibold text-[#a5b4fc]">{t('history.more')}</button>
      )}
    </div>
  );
}
