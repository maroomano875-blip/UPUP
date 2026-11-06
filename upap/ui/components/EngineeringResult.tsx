import React from 'react';

type Props = { o: Record<string, any>; conf: number; warnings: string[]; color: string; review: boolean };

const CARD = 'rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.7)] p-5';
const RED = 'border-[rgba(239,68,68,0.45)] bg-[rgba(239,68,68,0.1)] text-[#fca5a5]';
const AMBER = 'border-[rgba(245,158,11,0.4)] bg-[rgba(245,158,11,0.1)] text-[#fcd34d]';
const GREEN = 'border-[rgba(16,185,129,0.4)] bg-[rgba(16,185,129,0.1)] text-[#6ee7b7]';
const BLUE = 'border-[rgba(56,189,248,0.4)] bg-[rgba(56,189,248,0.1)] text-[#7dd3fc]';

const ITEM_STATUS: Record<string, { ar: string; cls: string }> = {
  ok: { ar: 'سليم', cls: GREEN },
  mismatch: { ar: 'خطأ حسابي', cls: RED },
  duplicate: { ar: 'مكرر', cls: AMBER },
  missing: { ar: 'بيانات ناقصة', cls: AMBER },
  suspect: { ar: 'يحتاج مراجعة', cls: AMBER },
};
const SEVERITY: Record<string, { ar: string; cls: string }> = {
  high: { ar: 'عالية', cls: RED },
  medium: { ar: 'متوسطة', cls: AMBER },
  low: { ar: 'منخفضة', cls: BLUE },
};
const ATTENTION: Record<string, { ar: string; cls: string }> = {
  urgent: { ar: 'يحتاج مراجعة هندسية عاجلة', cls: RED },
  soon: { ar: 'يُنصح بمراجعة قريبة', cls: AMBER },
  routine: { ar: 'الجدول سليم عموماً — مراجعة اعتيادية', cls: GREEN },
};
const DISCLAIMER = 'هذا فحص آلي لجدول الكميات وليس اعتماداً هندسياً؛ المراجعة والتوقيع من المهندس المختص.';

const toNum = (v: any): number | null => {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : Number(String(v).replace(/[,\s]/g, ''));
  return Number.isFinite(n) ? n : null;
};
const fmt = (n: number | null): string =>
  n === null ? '—' : n.toLocaleString('en-US', { maximumFractionDigits: 2 });

const Num = ({ v }: { v: number | null }) => <bdi dir="ltr">{fmt(v)}</bdi>;

export default function EngineeringResult({ o, conf, warnings, color, review }: Props) {
  const raw: any[] = Array.isArray(o.boq_items) ? o.boq_items : [];
  const issues: any[] = Array.isArray(o.issues) ? o.issues : [];
  const findings: string[] = Array.isArray(o.key_findings) ? o.key_findings : [];
  const questions: string[] = Array.isArray(o.questions_for_engineer) ? o.questions_for_engineer : [];
  const totals = o.totals && typeof o.totals === 'object' ? o.totals : {};
  const att = ATTENTION[String(o.attention_level)] ?? ATTENTION.routine;
  const cur = o.currency ? String(o.currency) : '';

  const seen = new Map<string, number>();
  const items = raw.map((it, i) => {
    const q = toNum(it.quantity);
    const u = toNum(it.unit_price);
    const t = toNum(it.total);
    const calc = q !== null && u !== null ? Math.round(q * u * 100) / 100 : null;
    const mismatch = calc !== null && t !== null && Math.abs(calc - t) > Math.max(0.01, Math.abs(calc) * 0.005);
    const key = [String(it.description ?? '').trim().toLowerCase(), String(it.unit ?? '').trim().toLowerCase(), u].join('|');
    const dup = key.length > 4 && seen.has(key);
    if (!seen.has(key)) seen.set(key, i);
    let status = String(it.status ?? 'ok');
    if (mismatch) status = 'mismatch';
    else if (dup) status = 'duplicate';
    else if (q === null || u === null || t === null) status = 'missing';
    else if (status === 'mismatch' || status === 'missing') status = 'ok';
    return { ...it, q, u, t, calc, status, dupOf: dup ? seen.get(key)! : null };
  });

  const sumStated = items.reduce((s, it) => s + (it.t ?? 0), 0);
  const sumCalc = items.reduce((s, it) => s + (it.calc ?? it.t ?? 0), 0);
  const statedSub = toNum(totals.stated_subtotal);
  const subMismatch = statedSub !== null && Math.abs(statedSub - sumStated) > Math.max(0.01, Math.abs(sumStated) * 0.005);
  const localErrors = items.filter((it) => it.status === 'mismatch').length;
  const localDups = items.filter((it) => it.status === 'duplicate').length;
  const localMissing = items.filter((it) => it.status === 'missing').length;

  const meta = [
    o.project_name ? 'المشروع: ' + o.project_name : '',
    o.document_date ? 'التاريخ: ' + o.document_date : '',
    cur ? 'العملة: ' + cur : '',
  ].filter(Boolean);

  return (
    <div className="mt-5 space-y-3">
      <div className={`rounded-lg border px-4 py-3 text-sm leading-7 ${att.cls}`}>
        <b>{att.ar}</b>
        {localErrors + localDups + localMissing > 0 && (
          <span> — {[localErrors > 0 ? `${localErrors} خطأ حسابي` : '', localDups > 0 ? `${localDups} بند مكرر` : '', localMissing > 0 ? `${localMissing} بند ناقص` : ''].filter(Boolean).join('، ')}</span>
        )}
      </div>

      {review && <div className={`rounded-lg border px-4 py-3 text-sm ${AMBER}`}>هذا الناتج يحتاج مراجعة بشرية قبل اعتماده.</div>}
      {warnings.map((w, i) => (
        <div key={i} className={`rounded-lg border px-4 py-3 text-sm ${AMBER}`}>{w}</div>
      ))}

      <div className={CARD}>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-[#e2e8f0]">{o.document_type || 'جدول كميات'}</h3>
          <span className="rounded-full border px-3 py-1 text-xs" style={{ borderColor: color, color }}>ثقة {Math.round(conf <= 1 ? conf * 100 : conf)}%</span>
        </div>
        {meta.length > 0 && <div className="mt-1 text-xs text-[#94a3b8]">{meta.join(' · ')}</div>}
        {o.summary && <p className="mt-3 text-sm leading-7 text-[#cbd5e1]">{o.summary}</p>}
      </div>

      {items.length > 0 && (
        <div className={CARD}>
          <h3 className="mb-3 text-sm font-semibold text-[#e2e8f0]">البنود ({items.length})</h3>
          <div className="space-y-2">
            {items.map((it, i) => {
              const st = ITEM_STATUS[it.status] ?? ITEM_STATUS.ok;
              return (
                <div key={i} className="rounded-lg border border-[rgba(255,255,255,0.08)] px-3 py-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm text-[#e2e8f0]">
                      {it.no ? <span className="text-[#94a3b8]">{String(it.no)}. </span> : null}
                      {it.description}
                    </div>
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs ${st.cls}`}>{st.ar}</span>
                  </div>
                  <div className="mt-1 text-xs text-[#94a3b8]">
                    {it.unit ? it.unit + ' · ' : ''}
                    <Num v={it.q} /> × <Num v={it.u} /> = <b className="text-[#e2e8f0]"><Num v={it.t} /></b>
                  </div>
                  {it.status === 'mismatch' && it.calc !== null && (
                    <div className="mt-1 text-xs text-[#fca5a5]">الناتج الصحيح حسابياً: <Num v={it.calc} /></div>
                  )}
                  {it.status === 'duplicate' && it.dupOf !== null && (
                    <div className="mt-1 text-xs text-[#fcd34d]">يطابق البند رقم {it.dupOf + 1} في الجدول</div>
                  )}
                  {it.note ? <div className="mt-1 text-xs text-[#94a3b8]">{it.note}</div> : null}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {items.length > 0 && (
        <div className={CARD}>
          <h3 className="mb-3 text-sm font-semibold text-[#e2e8f0]">المجاميع</h3>
          <div className="space-y-1 text-sm text-[#cbd5e1]">
            <div className="flex justify-between"><span>مجموع البنود كما هي مكتوبة</span><b><Num v={sumStated} /> {cur}</b></div>
            {Math.abs(sumCalc - sumStated) > 0.01 && (
              <div className="flex justify-between text-[#fcd34d]"><span>مجموع البنود بعد تصحيح الحساب</span><b><Num v={sumCalc} /> {cur}</b></div>
            )}
            <div className="flex justify-between"><span>المجموع المذكور في الوثيقة</span><b><Num v={statedSub} /> {cur}</b></div>
            {subMismatch && (
              <div className={`mt-2 rounded-lg border px-3 py-2 text-xs ${RED}`}>المجموع المذكور لا يطابق مجموع البنود، والفرق <Num v={Math.round(Math.abs((statedSub ?? 0) - sumStated) * 100) / 100} /> {cur}</div>
            )}
            {toNum(totals.stated_grand_total) !== null && (
              <div className="flex justify-between"><span>الإجمالي النهائي المذكور</span><b><Num v={toNum(totals.stated_grand_total)} /> {cur}</b></div>
            )}
          </div>
          {totals.notes ? <p className="mt-2 text-xs leading-6 text-[#94a3b8]">{String(totals.notes)}</p> : null}
        </div>
      )}

      {issues.length > 0 && (
        <div className={CARD}>
          <h3 className="mb-3 text-sm font-semibold text-[#e2e8f0]">الملاحظات والمشكلات</h3>
          <div className="space-y-2">
            {issues.map((is, i) => {
              const sv = SEVERITY[String(is.severity)] ?? SEVERITY.low;
              return (
                <div key={i} className="flex items-start gap-2 text-sm text-[#cbd5e1]">
                  <span className={`mt-0.5 shrink-0 rounded-full border px-2 py-0.5 text-xs ${sv.cls}`}>{sv.ar}</span>
                  <span>{is.item_no ? <b>{/^\d+$/.test(String(is.item_no)) ? 'بند ' + String(is.item_no) : (String(is.item_no).toLowerCase() === 'total' ? 'المجموع' : String(is.item_no))}: </b> : null}{is.description}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {findings.length > 0 && (
        <div className={CARD}>
          <h3 className="mb-3 text-sm font-semibold text-[#e2e8f0]">أهم الملاحظات</h3>
          <ul className="list-disc space-y-1 ps-5 text-sm leading-7 text-[#cbd5e1]">
            {findings.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </div>
      )}

      {questions.length > 0 && (
        <div className={CARD}>
          <h3 className="mb-3 text-sm font-semibold text-[#e2e8f0]">أسئلة مقترحة للمهندس</h3>
          <ul className="list-disc space-y-1 ps-5 text-sm leading-7 text-[#cbd5e1]">
            {questions.map((q, i) => <li key={i}>{q}</li>)}
          </ul>
        </div>
      )}

      <div className="rounded-lg border border-[rgba(255,255,255,0.08)] px-4 py-3 text-xs text-[#94a3b8]">{DISCLAIMER}</div>
    </div>
  );
}
