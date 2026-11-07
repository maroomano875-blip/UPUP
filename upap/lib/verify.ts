// التحقق من الأرقام والتواريخ بالكود لا بحساب النموذج (مفصول عن الواجهة ليسهل اختباره)
export const toNum = (v: any): number | null => {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : Number(String(v).replace(/[,\s]/g, ''));
  return Number.isFinite(n) ? n : null;
};

export type CheckRow = { label: any; stated: number | null; sum: number | null; bad: boolean };
export type DateRow = { label: any; quote: any; start: any; end: any; bad: boolean };

// يقارن الرقم المعلن بمجموع الأجزاء؛ التسامح: 0.5% من المجموع أو 0.01 أيهما أكبر
export function verifyChecks(raw: unknown): CheckRow[] {
  return (Array.isArray(raw) ? raw : []).map((c: any) => {
    const stated = toNum(c?.stated);
    const parts: number[] = Array.isArray(c?.parts)
      ? c.parts.map((p: any) => toNum(p)).filter((n: number | null): n is number => n !== null)
      : [];
    const sum = parts.length ? Math.round(parts.reduce((a: number, b: number) => a + b, 0) * 100) / 100 : null;
    const bad = stated !== null && sum !== null && Math.abs(stated - sum) > Math.max(0.01, Math.abs(sum) * 0.005);
    return { label: c?.label, stated, sum, bad };
  });
}

// تاريخ النهاية قبل البداية = مشكلة؛ أي قيمة غير مفهومة لا تُعدّ خطأ
export function verifyDates(raw: unknown): DateRow[] {
  return (Array.isArray(raw) ? raw : []).map((d: any) => {
    const a = Date.parse(String(d?.start));
    const b = Date.parse(String(d?.end));
    const bad = Number.isFinite(a) && Number.isFinite(b) && a > b;
    return { label: d?.label, quote: d?.quote, start: d?.start, end: d?.end, bad };
  });
}
