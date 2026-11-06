import React from 'react';

type Props = { o: Record<string, any>; conf: number; warnings: string[]; color: string; review: boolean };

const CARD = 'rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.7)] p-5';
const RED = 'border-[rgba(239,68,68,0.45)] bg-[rgba(239,68,68,0.1)] text-[#fca5a5]';
const AMBER = 'border-[rgba(245,158,11,0.4)] bg-[rgba(245,158,11,0.1)] text-[#fcd34d]';
const GREEN = 'border-[rgba(16,185,129,0.4)] bg-[rgba(16,185,129,0.1)] text-[#6ee7b7]';
const BLUE = 'border-[rgba(56,189,248,0.4)] bg-[rgba(56,189,248,0.1)] text-[#7dd3fc]';

const STATUS: Record<string, { ar: string; cls: string }> = {
  ok: { ar: 'سليم', cls: GREEN },
  warn: { ar: 'يحتاج انتباه', cls: AMBER },
  issue: { ar: 'مشكلة', cls: RED },
  info: { ar: 'معلومة', cls: BLUE },
};
const ATTENTION: Record<string, { ar: string; cls: string }> = {
  urgent: { ar: 'يحتاج مراجعة عاجلة', cls: RED },
  soon: { ar: 'يُنصح بمراجعة قريبة', cls: AMBER },
  routine: { ar: 'لا ملاحظات جوهرية — مراجعة اعتيادية', cls: GREEN },
};
const DISCLAIMER = 'هذا فحص آلي مساعد وليس رأياً مهنياً نهائياً؛ المراجعة النهائية للمختص.';

const toNum = (v: any): number | null => {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : Number(String(v).replace(/[,\s]/g, ''));
  return Number.isFinite(n) ? n : null;
};
const fmt = (n: number | null): string => (n === null ? '—' : n.toLocaleString('en-US', { maximumFractionDigits: 2 }));
const Num = ({ v }: { v: number | null }) => <bdi dir="ltr">{fmt(v)}</bdi>;

export default function GenericResult({ o, conf, warnings, color, review }: Props) {
  const sections: any[] = Array.isArray(o.sections) ? o.sections : [];
  const findings: string[] = Array.isArray(o.key_findings) ? o.key_findings : [];
  const questions: string[] = Array.isArray(o.questions_for_user) ? o.questions_for_user : [];

  // الأرقام تُجمع وتُقارن بالكود، لا بحساب النموذج
  const checks = (Array.isArray(o.checks) ? o.checks : []).map((c: any) => {
    const stated = toNum(c.stated);
    const parts: number[] = Array.isArray(c.parts) ? c.parts.map((p: any) => toNum(p)).filter((n: number | null): n is number => n !== null) : [];
    const sum = parts.length ? Math.round(parts.reduce((a: number, b: number) => a + b, 0) * 100) / 100 : null;
    const bad = stated !== null && sum !== null && Math.abs(stated - sum) > Math.max(0.01, Math.abs(sum) * 0.005);
    return { label: c.label, stated, sum, bad };
  });
  const dateChecks = (Array.isArray(o.date_checks) ? o.date_checks : []).map((d: any) => {
    const a = Date.parse(String(d.start));
    const b = Date.parse(String(d.end));
    const bad = Number.isFinite(a) && Number.isFinite(b) && a > b;
    return { label: d.label, quote: d.quote, start: d.start, end: d.end, bad };
  });
  const badChecks = checks.filter((c: any) => c.bad).length + dateChecks.filter((d: any) => d.bad).length;

  const base = ATTENTION[String(o.attention_level)] ?? ATTENTION.routine;
  const att = badChecks > 0 && base === ATTENTION.routine ? ATTENTION.soon : base;

  return (
    <div className="mt-5 space-y-3">
      <div className={`rounded-lg border px-4 py-3 text-sm leading-7 ${att.cls}`}>
        <b>{att.ar}</b>
        {badChecks > 0 && <span> — {badChecks} عدم تطابق في الأرقام</span>}
      </div>
      {review && <div className={`rounded-lg border px-4 py-3 text-sm ${AMBER}`}>هذا الناتج يحتاج مراجعة بشرية قبل اعتماده.</div>}
      {warnings.map((w, i) => (
        <div key={i} className={`rounded-lg border px-4 py-3 text-sm ${AMBER}`}>{w}</div>
      ))}

      <div className={CARD}>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-[#e2e8f0]">{o.document_type || 'نتيجة التحليل'}</h3>
          <span className="rounded-full border px-3 py-1 text-xs" style={{ borderColor: color, color }}>ثقة {Math.round(conf <= 1 ? conf * 100 : conf)}%</span>
        </div>
        {o.summary && <p className="mt-3 text-sm leading-7 text-[#cbd5e1]">{o.summary}</p>}
      </div>

      {checks.length > 0 && (
        <div className={CARD}>
          <h3 className="mb-3 text-sm font-semibold text-[#e2e8f0]">فحص الأرقام</h3>
          <div className="space-y-2 text-sm text-[#cbd5e1]">
            {checks.map((c: any, i: number) => (
              <div key={i} className="rounded-lg border border-[rgba(255,255,255,0.08)] px-3 py-2">
                <div className="flex items-start justify-between gap-2">
                  <span>{c.label}</span>
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs ${c.bad ? RED : GREEN}`}>{c.bad ? 'غير متطابق' : 'متطابق'}</span>
                </div>
                <div className="mt-1 text-xs text-[#94a3b8]">المعلن: <Num v={c.stated} /> · المحسوب: <Num v={c.sum} /></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {dateChecks.length > 0 && (
        <div className={CARD}>
          <h3 className="mb-3 text-sm font-semibold text-[#e2e8f0]">فحص التواريخ</h3>
          <div className="space-y-2 text-sm text-[#cbd5e1]">
            {dateChecks.map((d: any, i: number) => (
              <div key={i} className="rounded-lg border border-[rgba(255,255,255,0.08)] px-3 py-2">
                <div className="flex items-start justify-between gap-2">
                  <span>{d.label}</span>
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs ${d.bad ? RED : GREEN}`}>{d.bad ? 'النهاية قبل البداية' : 'مرتبة'}</span>
                </div>
                <div className="mt-1 text-xs text-[#94a3b8]">من <bdi dir="ltr">{String(d.start ?? '—')}</bdi> إلى <bdi dir="ltr">{String(d.end ?? '—')}</bdi></div>
                {d.quote ? <div className="mt-1 text-xs leading-6 text-[#cbd5e1]">النص الأصلي: «{String(d.quote)}»</div> : null}
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
              const st = STATUS[String(it.status)] ?? STATUS.info;
              return (
                <div key={j} className="rounded-lg border border-[rgba(255,255,255,0.08)] px-3 py-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm text-[#e2e8f0]">{it.label}</div>
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs ${st.cls}`}>{st.ar}</span>
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
          <h3 className="mb-3 text-sm font-semibold text-[#e2e8f0]">أهم الملاحظات</h3>
          <ul className="list-disc space-y-1 ps-5 text-sm leading-7 text-[#cbd5e1]">{findings.map((f, i) => <li key={i}>{f}</li>)}</ul>
        </div>
      )}
      {questions.length > 0 && (
        <div className={CARD}>
          <h3 className="mb-3 text-sm font-semibold text-[#e2e8f0]">أسئلة مقترحة</h3>
          <ul className="list-disc space-y-1 ps-5 text-sm leading-7 text-[#cbd5e1]">{questions.map((q, i) => <li key={i}>{q}</li>)}</ul>
        </div>
      )}
      <div className="rounded-lg border border-[rgba(255,255,255,0.08)] px-4 py-3 text-xs text-[#94a3b8]">{o.disclaimer || DISCLAIMER}</div>
    </div>
  );
}
