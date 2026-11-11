import { judgeDates, type DateVerdict } from './dates';
// التحقق من الأرقام والتواريخ بالكود لا بحساب النموذج (مفصول عن الواجهة ليسهل اختباره)
import { parseNum, toNum, type Conv } from './numbers';
export { toNum };

export type CheckRow = { label: any; stated: number | null; sum: number | null; bad: boolean };
export type DateRow = { label: any; quote: any; start: any; end: any; bad: boolean } & Omit<DateVerdict, 'bad'>;

// يقارن الرقم المعلن بمجموع الأجزاء؛ التسامح: 0.5% من المجموع أو 0.01 أيهما أكبر.
// إن كانت الأرقام ملتبسة (1,234 قد تكون ألفاً ومئتين أو واحداً فاصلة 234) نجرّب الاتفاقيتين، ولا نُعلن عدم تطابق إلا إذا فشلتا معاً.
function checkOne(c: any, conv: Conv): CheckRow & { amb: boolean } { // eslint-disable-line @typescript-eslint/no-explicit-any
  const st = parseNum(c?.stated, conv);
  const ps = (Array.isArray(c?.parts) ? c.parts : []).map((p: any) => parseNum(p, conv)); // eslint-disable-line @typescript-eslint/no-explicit-any
  const parts: number[] = ps.map((p: { n: number | null }) => p.n).filter((n: number | null): n is number => n !== null);
  const sum = parts.length ? Math.round(parts.reduce((a: number, b: number) => a + b, 0) * 100) / 100 : null;
  const bad = st.n !== null && sum !== null && Math.abs(st.n - sum) > Math.max(0.01, Math.abs(sum) * 0.005);
  return { label: c?.label, stated: st.n, sum, bad, amb: st.ambiguous || ps.some((p: { ambiguous: boolean }) => p.ambiguous) };
}
export function verifyChecks(raw: unknown): CheckRow[] {
  return (Array.isArray(raw) ? raw : []).map((c: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const en = checkOne(c, 'en');
    if (!en.bad || !en.amb) return { label: en.label, stated: en.stated, sum: en.sum, bad: en.bad };
    const eu = checkOne(c, 'eu');
    const pick = eu.bad ? en : eu;
    return { label: pick.label, stated: pick.stated, sum: pick.sum, bad: pick.bad };
  });
}

// تاريخ النهاية قبل البداية = مشكلة، بحسب تقويم الملف نفسه (lib/dates.ts)؛ أي قيمة غير مفهومة لا تُعدّ خطأ
export function verifyDates(raw: unknown): DateRow[] {
  return (Array.isArray(raw) ? raw : []).map((d: any) => {
    let v = judgeDates(d?.start, d?.end, d?.quote);
    if (v.cal === 'unknown' && !v.issues.includes('invalid')) {
      // نصٌّ غير ISO: نحتفظ بالسلوك القديم المتساهل (ترتيب فقط إن فُهم التاريخان)
      const a = Date.parse(String(d?.start)), b = Date.parse(String(d?.end));
      v = { ...v, bad: Number.isFinite(a) && Number.isFinite(b) && a > b };
    }
    return { label: d?.label, quote: d?.quote, start: d?.start, end: d?.end, ...v };
  });
}

const near = (a: number, b: number) => Math.abs(a - b) <= Math.max(0.01, Math.abs(b) * 0.005);
const r2 = (n: number) => Math.round(n * 100) / 100;

// الملاحظات تُرجَع كرموز وقيم، وتُصاغ جملةً بلغة الواجهة في lib/i18n/format.ts
export type InvoiceIssue =
  | { code: 'line'; n: number; q: number; u: number; calc: number; stated: number }
  | { code: 'itemsSum'; sum: number; sub: number }
  | { code: 'total'; sub: number; tax: number; calc: number; stated: number }
  | { code: 'due' };

// بنود الفاتورة: الكمية × السعر = إجمالي البند، ومجموع البنود = المجموع الفرعي
export function invoiceItemIssues(o: any, conv: Conv = 'en', seen?: { amb: boolean }): InvoiceIssue[] {
  const toNum = (v: unknown) => { const p = parseNum(v, conv); if (p.ambiguous && seen) seen.amb = true; return p.n; };
  const out: InvoiceIssue[] = [];
  const items = Array.isArray(o?.line_items) ? o.line_items : [];
  const tots: number[] = [];
  items.forEach((it: any, i: number) => {
    const q = toNum(it?.quantity), u = toNum(it?.unit_price), t = toNum(it?.total);
    if (t !== null) tots.push(t);
    if (q && u && t !== null && !near(q * u, t)) out.push({ code: 'line', n: i + 1, q, u, calc: r2(q * u), stated: t });
  });
  const sub = toNum(o?.subtotal);
  const s = r2(tots.reduce((a, b) => a + b, 0));
  if (tots.length && sub && !near(s, sub)) out.push({ code: 'itemsSum', sum: s, sub });
  return out;
}

// الإجمالي = المجموع الفرعي + الضريبة، وتاريخ الاستحقاق لا يسبق تاريخ الفاتورة
function invoiceIssuesWith(o: any, conv: Conv, seen: { amb: boolean }): InvoiceIssue[] {
  const toNum = (v: unknown) => { const p = parseNum(v, conv); if (p.ambiguous) seen.amb = true; return p.n; };
  const out = invoiceItemIssues(o, conv, seen);
  const sub = toNum(o?.subtotal), tax = toNum(o?.tax) ?? 0, tot = toNum(o?.total);
  if (sub && tot && !near(sub + tax, tot)) out.push({ code: 'total', sub, tax, calc: r2(sub + tax), stated: tot });
  if (verifyDates([{ start: o?.invoice_date, end: o?.due_date }])[0].bad) out.push({ code: 'due' }); // بحسب تقويم الملف
  return out;
}

export function verifyInvoice(o: any): InvoiceIssue[] {
  const seen = { amb: false };
  const en = invoiceIssuesWith(o, 'en', seen);
  if (!en.length || !seen.amb) return en;
  const eu = invoiceIssuesWith(o, 'eu', { amb: false });
  return eu.length < en.length ? eu : en;
}
