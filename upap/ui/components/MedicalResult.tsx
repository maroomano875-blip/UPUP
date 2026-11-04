import React from 'react';

type Props = { o: Record<string, any>; conf: number; warnings: string[]; color: string; review: boolean };

const CARD = 'rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.7)] p-5';
const RED = 'border-[rgba(239,68,68,0.45)] bg-[rgba(239,68,68,0.1)] text-[#fca5a5]';
const AMBER = 'border-[rgba(245,158,11,0.4)] bg-[rgba(245,158,11,0.1)] text-[#fcd34d]';
const GREEN = 'border-[rgba(16,185,129,0.4)] bg-[rgba(16,185,129,0.1)] text-[#6ee7b7]';
const BLUE = 'border-[rgba(56,189,248,0.4)] bg-[rgba(56,189,248,0.1)] text-[#7dd3fc]';
const GRAY = 'border-[rgba(148,163,184,0.4)] bg-[rgba(148,163,184,0.1)] text-[#cbd5e1]';

const STATUS: Record<string, { ar: string; cls: string }> = {
  normal: { ar: 'ضمن المجال', cls: GREEN },
  low: { ar: 'منخفض', cls: AMBER },
  high: { ar: 'مرتفع', cls: AMBER },
  critical: { ar: 'حرج', cls: RED },
  unknown: { ar: 'غير محدد', cls: GRAY },
};
const ATTENTION: Record<string, { ar: string; cls: string }> = {
  urgent: { ar: 'يحتاج اهتماماً عاجلاً', cls: RED },
  soon: { ar: 'يُنصح بمراجعة الطبيب قريباً', cls: AMBER },
  routine: { ar: 'متابعة اعتيادية', cls: BLUE },
};
const DISCLAIMER = 'هذا تلخيص آلي لما ورد في التقرير وليس رأياً طبياً ولا بديلاً عن استشارة الطبيب.';

export default function MedicalResult({ o, conf, warnings, color, review }: Props) {
  const tests: any[] = Array.isArray(o.tests) ? o.tests : [];
  const findings: string[] = Array.isArray(o.key_findings) ? o.key_findings : [];
  const questions: string[] = Array.isArray(o.questions_for_doctor) ? o.questions_for_doctor : [];
  const att = ATTENTION[String(o.attention_level)] ?? ATTENTION.routine;
  const patient = o.patient && typeof o.patient === 'object' ? o.patient : {};
  const meta = [
    o.report_date ? 'التاريخ: ' + o.report_date : '',
    patient.age ? 'العمر: ' + patient.age : '',
    patient.sex ? 'الجنس: ' + patient.sex : '',
  ].filter(Boolean);

  return (
    <div className="mt-5 space-y-3">
      <div className={`rounded-lg border px-4 py-3 text-sm leading-7 ${att.cls}`}>
        <b>{att.ar}</b>
        {o.attention_note ? ' — ' + o.attention_note : ''}
      </div>
      {review && (
        <div className="rounded-lg border border-[rgba(245,158,11,0.4)] bg-[rgba(245,158,11,0.1)] px-4 py-3 text-sm text-[#fcd34d]">
          هذا الناتج يحتاج مراجعة بشرية قبل اعتماده.
        </div>
      )}

      <div className={CARD}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{o.document_type || 'تقرير طبي'}</h3>
          <span className="rounded-full px-3 py-0.5 text-xs font-bold text-[#0f172a]" style={{ background: color }}>{conf}% ثقة</span>
        </div>
        {meta.length > 0 && <p className="mt-2 text-xs text-[#94a3b8]" dir="auto">{meta.join(' · ')}</p>}
        {o.summary && <p className="mt-3 text-sm leading-7 text-[#cbd5e1]" dir="auto">{o.summary}</p>}
      </div>

      {tests.length > 0 && (
        <div className={CARD}>
          <h3 className="font-semibold">الفحوص</h3>
          <div className="mt-3 space-y-2">
            {tests.map((t, i) => {
              const st = STATUS[String(t.status)] ?? STATUS.unknown;
              return (
                <div key={i} className="rounded-lg border border-[rgba(255,255,255,0.08)] px-3 py-2">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="font-semibold" dir="auto">{t.name}</span>
                    <span className={`rounded-full border px-2 py-0.5 text-xs ${st.cls}`}>{st.ar}</span>
                  </div>
                  <div className="mt-1 text-sm text-[#f1f5f9]" dir="auto">
                    {[t.value, t.unit].filter(Boolean).join(' ') || '—'}
                    {t.reference_range ? <span className="text-xs text-[#94a3b8]">{'  (المجال: ' + '\u2066' + t.reference_range + '\u2069' + ')'}</span> : null}
                  </div>
                  {t.note ? <p className="mt-1 text-xs leading-6 text-[#94a3b8]" dir="auto">{t.note}</p> : null}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {findings.length > 0 && (
        <div className={CARD}>
          <h3 className="font-semibold">أهم الملاحظات</h3>
          <ul className="mt-3 list-disc space-y-1 pr-5 text-sm leading-7 text-[#cbd5e1]">
            {findings.map((f, i) => <li key={i} dir="auto">{f}</li>)}
          </ul>
        </div>
      )}

      {questions.length > 0 && (
        <div className={CARD}>
          <h3 className="font-semibold">أسئلة مقترحة لطبيبك</h3>
          <ul className="mt-3 list-disc space-y-1 pr-5 text-sm leading-7 text-[#cbd5e1]">
            {questions.map((q, i) => <li key={i} dir="auto">{q}</li>)}
          </ul>
        </div>
      )}

      {warnings.length > 0 && (
        <ul className="space-y-1">
          {warnings.map((w, i) => <li key={i} className={`rounded-lg border px-3 py-2 text-sm ${AMBER}`}>{w}</li>)}
        </ul>
      )}

      <p className="rounded-lg border border-[rgba(255,255,255,0.1)] px-4 py-3 text-xs leading-6 text-[#94a3b8]">{o.disclaimer || DISCLAIMER}</p>
    </div>
  );
}
