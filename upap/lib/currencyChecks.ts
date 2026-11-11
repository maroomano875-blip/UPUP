// ============================================================
// تنبيهات العملة للفاتورة (معلوماتية لا تمنع شيئاً): اختلاف عملة المستند عن عملة البلد،
// وكسور عشرية أكثر مما تسمح به العملة (الدينار الكويتي 3، الليرة السورية 0 ...)
// ============================================================
import { parseNum } from './numbers';

export type CurAdvisory =
  | { code: 'curDiff'; doc: string; local: string }
  | { code: 'decimals'; cur: string; max: number; found: number; field: string };

// الخانات العشرية المسموحة للعملة من Intl نفسه؛ null إن لم تُعرف العملة
export function minorDigits(cur: string): number | null {
  try { return new Intl.NumberFormat('en', { style: 'currency', currency: cur }).resolvedOptions().maximumFractionDigits ?? null; }
  catch { return null; }
}

const decimalsOf = (n: number) => { const s = String(Math.round(Math.abs(n) * 1e6) / 1e6); const i = s.indexOf('.'); return i < 0 ? 0 : s.length - i - 1; };

export function currencyAdvisories(o: any, localCur: string): CurAdvisory[] {
  const doc = String(o?.currency ?? '').trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(doc)) return [];
  const out: CurAdvisory[] = [];
  if (doc !== localCur) out.push({ code: 'curDiff', doc, local: localCur });
  const max = minorDigits(doc);
  if (max !== null) {
    for (const field of ['total', 'subtotal', 'tax']) {
      const p = parseNum(o?.[field], 'en');
      if (p.n == null || p.ambiguous) continue; // الشكل الملتبس (1,234) لا نحكم عليه
      const found = decimalsOf(p.n);
      if (found > max) { out.push({ code: 'decimals', cur: doc, max, found, field }); break; }
    }
  }
  return out;
}
