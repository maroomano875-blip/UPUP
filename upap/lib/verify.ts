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

const near = (a: number, b: number) => Math.abs(a - b) <= Math.max(0.01, Math.abs(b) * 0.005);
const r2 = (n: number) => Math.round(n * 100) / 100;

// بنود الفاتورة: الكمية × السعر = إجمالي البند، ومجموع البنود = المجموع الفرعي
export function invoiceItemIssues(o: any): string[] {
  const out: string[] = [];
  const items = Array.isArray(o?.line_items) ? o.line_items : [];
  const tots: number[] = [];
  items.forEach((it: any, i: number) => {
    const q = toNum(it?.quantity), u = toNum(it?.unit_price), t = toNum(it?.total);
    if (t !== null) tots.push(t);
    if (q && u && t !== null && !near(q * u, t)) out.push(`البند ${i + 1}: ${q} × ${u} = ${r2(q * u)} لكن المكتوب ${t}`);
  });
  const sub = toNum(o?.subtotal);
  const s = r2(tots.reduce((a, b) => a + b, 0));
  if (tots.length && sub && !near(s, sub)) out.push(`مجموع البنود ${s} لا يساوي المجموع الفرعي ${sub}`);
  return out;
}

// الإجمالي = المجموع الفرعي + الضريبة، وتاريخ الاستحقاق لا يسبق تاريخ الفاتورة
export function verifyInvoice(o: any): string[] {
  const out = invoiceItemIssues(o);
  const sub = toNum(o?.subtotal), tax = toNum(o?.tax) ?? 0, tot = toNum(o?.total);
  if (sub && tot && !near(sub + tax, tot)) out.push(`${sub} + ${tax} = ${r2(sub + tax)} لكن الإجمالي المكتوب ${tot}`);
  const a = Date.parse(String(o?.invoice_date)), b = Date.parse(String(o?.due_date));
  if (Number.isFinite(a) && Number.isFinite(b) && b < a) out.push('تاريخ الاستحقاق يسبق تاريخ الفاتورة');
  return out;
}
