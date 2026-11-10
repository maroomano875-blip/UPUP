import React from 'react';
import { verifyChecks, verifyDates } from '../../lib/verify';
import { useI18n } from './I18nProvider';
import type { Key } from '../../lib/i18n';

type Props = { o: Record<string, any>; conf: number; warnings: string[]; color: string; review: boolean };

const CARD = 'rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.7)] p-5';
const RED = 'border-[rgba(239,68,68,0.45)] bg-[rgba(239,68,68,0.1)] text-[#fca5a5]';
const AMBER = 'border-[rgba(245,158,11,0.4)] bg-[rgba(245,158,11,0.1)] text-[#fcd34d]';
const GREEN = 'border-[rgba(16,185,129,0.4)] bg-[rgba(16,185,129,0.1)] text-[#6ee7b7]';
const BLUE = 'border-[rgba(56,189,248,0.4)] bg-[rgba(56,189,248,0.1)] text-[#7dd3fc]';

const STATUS_CLS: Record<string, string> = { ok: GREEN, warn: AMBER, issue: RED, info: BLUE };
const ATT_CLS: Record<string, string> = { urgent: RED, soon: AMBER, routine: GREEN };

const fmt = (n: number | null): string => (n === null ? '—' : n.toLocaleString('en-US', { maximumFractionDigits: 2 }));
const Num = ({ v }: { v: number | null }) => <bdi dir="ltr">{fmt(v)}</bdi>;

export default function GenericResult({ o, conf, warnings, color, review }: Props) {
  const { t } = useI18n();
  const sections: any[] = Array.isArray(o.sections) ? o.sections : [];
  const findings: string[] = Array.isArray(o.key_findings) ? o.key_findings : [];
  const questions: string[] = Array.isArray(o.questions_for_user) ? o.questions_for_user : [];

  // الأرقام تُجمع وتُقارن بالكود، لا بحساب النموذج
  const checks = verifyChecks(o.checks);
  const dateChecks = verifyDates(o.date_checks);
  const badChecks = checks.filter((c: any) => c.bad).length + dateChecks.filter((d: any) => d.bad).length;

  let lvl = ['urgent', 'soon', 'routine'].includes(String(o.attention_level)) ? String(o.attention_level) : 'routine';
  if (badChecks > 0 && lvl === 'routine') lvl = 'soon';
  const att = { cls: ATT_CLS[lvl], text: t(`res.att.${lvl}` as 'res.att.soon') };

  return (
    <div className="mt-5 space-y-3">
      <div className={`rounded-lg border px-4 py-3 text-sm leading-7 ${att.cls}`}>
        <b>{att.text}</b>
        {badChecks > 0 && <span> — {t('res.mismatches', { n: badChecks })}</span>}
      </div>
      {review && <div className={`rounded-lg border px-4 py-3 text-sm ${AMBER}`}>{t('res.review')}</div>}
      {warnings.map((w, i) => (
        <div key={i} className={`rounded-lg border px-4 py-3 text-sm ${AMBER}`}>{w}</div>
      ))}

      <div className={CARD}>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-[#e2e8f0]">{o.document_type || t('res.defaultTitle')}</h3>
          <span className="rounded-full border px-3 py-1 text-xs" style={{ borderColor: color, color }}>{t('res.confidence', { n: Math.round(conf <= 1 ? conf * 100 : conf) })}</span>
        </div>
        {o.summary && <p className="mt-3 text-sm leading-7 text-[#cbd5e1]">{o.summary}</p>}
      </div>

      {checks.length > 0 && (
        <div className={CARD}>
          <h3 className="mb-3 text-sm font-semibold text-[#e2e8f0]">{t('res.numCheck')}</h3>
          <div className="space-y-2 text-sm text-[#cbd5e1]">
            {checks.map((c: any, i: number) => (
              <div key={i} className="rounded-lg border border-[rgba(255,255,255,0.08)] px-3 py-2">
                <div className="flex items-start justify-between gap-2">
                  <span>{c.label}</span>
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs ${c.bad ? RED : GREEN}`}>{c.bad ? t('res.noMatch') : t('res.match')}</span>
                </div>
                <div className="mt-1 text-xs text-[#94a3b8]">{t('res.stated')}: <Num v={c.stated} /> · {t('res.computed')}: <Num v={c.sum} /></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {dateChecks.length > 0 && (
        <div className={CARD}>
          <h3 className="mb-3 text-sm font-semibold text-[#e2e8f0]">{t('res.dateCheck')}</h3>
          <div className="space-y-2 text-sm text-[#cbd5e1]">
            {dateChecks.map((d: any, i: number) => (
              <div key={i} className="rounded-lg border border-[rgba(255,255,255,0.08)] px-3 py-2">
                <div className="flex items-start justify-between gap-2">
                  <span>{d.label}</span>
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs ${d.bad ? RED : GREEN}`}>{d.bad ? t('res.endBeforeStart') : t('res.ordered')}</span>
                </div>
                <div className="mt-1 text-xs text-[#94a3b8]">{t('res.fromTo', { a: `\u2066${String(d.start ?? '—')}\u2069`, b: `\u2066${String(d.end ?? '—')}\u2069` })}</div>
                {d.cal !== 'unknown' && <div className="mt-1 text-xs text-[#94a3b8]">{t(`res.cal.${d.cal}` as 'res.cal.hijri')}</div>}
                {(d.issues ?? []).map((k: string) => (
                  <div key={k} className="mt-1 text-xs leading-6 text-[#fbbf24]">{t(`res.dateIssue.${k}` as 'res.dateIssue.invalid', { a: `\u2066${d.gStart ?? ''}\u2069`, b: `\u2066${d.gEnd ?? ''}\u2069` })}</div>
                ))}
                {d.quote ? <div className="mt-1 text-xs leading-6 text-[#cbd5e1]">{t('res.modelRead', { q: String(d.quote) })}</div> : null}
              </div>
            ))}
          </div>
        </div>
      )}

      {sections.map((sec: any, i: number) => (
        <div key={i} className={CARD}>
          <h3 className="mb-3 text-sm font-semibold text-[#e2e8f0]">{sec.title}</h3>
          <div className="space-y-2">
            {(Array.isArray(sec.items) ? sec.items : []).map((it: any, j: number) => {
              const sk = STATUS_CLS[String(it.status)] ? String(it.status) : 'info';
              return (
                <div key={j} className="rounded-lg border border-[rgba(255,255,255,0.08)] px-3 py-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm text-[#e2e8f0]">{it.label}</div>
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs ${STATUS_CLS[sk]}`}>{t(`res.status.${sk}` as 'res.status.ok')}</span>
                  </div>
                  {it.detail ? <div className="mt-1 text-xs leading-6 text-[#94a3b8]">{it.detail}</div> : null}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {findings.length > 0 && (
        <div className={CARD}>
          <h3 className="mb-3 text-sm font-semibold text-[#e2e8f0]">{t('res.keyFindings')}</h3>
          <ul className="list-disc space-y-1 ps-5 text-sm leading-7 text-[#cbd5e1]">{findings.map((f, i) => <li key={i}>{f}</li>)}</ul>
        </div>
      )}
      {questions.length > 0 && (
        <div className={CARD}>
          <h3 className="mb-3 text-sm font-semibold text-[#e2e8f0]">{t('res.questions')}</h3>
          <ul className="list-disc space-y-1 ps-5 text-sm leading-7 text-[#cbd5e1]">{questions.map((q, i) => <li key={i}>{q}</li>)}</ul>
        </div>
      )}
      <div className="rounded-lg border border-[rgba(255,255,255,0.08)] px-4 py-3 text-xs text-[#94a3b8]">{o.disclaimer || t('res.disclaimer')}</div>
    </div>
  );
}
