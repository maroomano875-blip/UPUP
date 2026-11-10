// قراءة الأرقام من نصوص المستندات بكل الصيغ الشائعة: 1,234.56 | 1.234,56 | 1 234,56 | 1’234.50 | ١٢٣٤٫٥٠ | (1,234.50) | 15%
// المبدأ: لا نخمّن بصمت. الصيغة الملتبسة الوحيدة هي فاصل واحد يليه ثلاثة أرقام بالضبط (1,234 أو 1.234)،
// فيُعاد ambiguous=true ويجرّب المُتحقِّق الاتفاقيتين (en: النقطة عشرية، eu: الفاصلة عشرية).
export type Conv = 'en' | 'eu';
export type Parsed = { n: number | null; ambiguous: boolean };

const ARABIC_DIGITS: Record<string, string> = { '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
  '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4', '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9' };

export function parseNum(v: unknown, conv: Conv = 'en'): Parsed {
  if (typeof v === 'number') return { n: Number.isFinite(v) ? v : null, ambiguous: false };
  if (typeof v !== 'string') return { n: null, ambiguous: false };
  let s = v.normalize('NFKC').trim();
  if (!s) return { n: null, ambiguous: false };
  s = s.replace(/[٠-٩۰-۹]/g, (d) => ARABIC_DIGITS[d]).replace(/٫/g, '.').replace(/٬/g, ',');
  if (/^[+-]?\d+(\.\d+)?e[+-]?\d+$/i.test(s)) { const n = Number(s); return { n: Number.isFinite(n) ? n : null, ambiguous: false }; }

  // الإشارة: ناقص (عادي أو يونيكود) في البداية أو النهاية، أو أقواس محاسبية
  // تواريخ ونسب ونطاقات (2026-01-05، 3:30، 1/2، 10-20) ليست أرقاماً: نرفضها بدل دمج أرقامها
  if (/\d\s*[-−–/:]\s*\d/.test(s)) return { n: null, ambiguous: false };
  const neg = /\([^()]*\d[^()]*\)/.test(s) || /^[^\d]*[-−–]\s*\d/.test(s) || /\d[\s.,]*[-−–]$/.test(s);
  // نُبقي الأرقام والفواصل فقط (الرموز والحروف ورموز العملات والمسافات وعلامات ' ’ كفواصل آلاف تُحذف)
  s = s.replace(/[^\d.,]/g, '');
  if (!/\d/.test(s)) return { n: null, ambiguous: false };
  s = s.replace(/^[.,]+|[.,]+$/g, '');

  const hasDot = s.includes('.'), hasComma = s.includes(',');
  let dec: '.' | ',' | null = null;
  let ambiguous = false;
  if (hasDot && hasComma) {
    dec = s.lastIndexOf('.') > s.lastIndexOf(',') ? '.' : ',';
  } else if (hasDot || hasComma) {
    const sep = hasDot ? '.' : ',';
    const parts = s.split(sep);
    if (parts.length > 2) dec = null; // مكرر = فاصل آلاف (1.234.567)
    else if (parts[1].length === 3 && parts[0] !== '0' && parts[0] !== '') {
      ambiguous = true;
      dec = conv === 'en' ? '.' : ',';
      if (dec !== sep) dec = null; // الفاصل الوحيد صار فاصل آلاف
    } else dec = sep; // عدد الخانات ≠ 3 → عشري
  }
  const thousands = dec === '.' ? ',' : dec === ',' ? '.' : null;
  let t = s;
  if (dec === null) t = t.replace(/[.,]/g, '');
  else {
    if (thousands) t = t.split(thousands).join('');
    t = t.replace(dec, '.');
  }
  const n = Number(t);
  if (!Number.isFinite(n)) return { n: null, ambiguous: false };
  return { n: neg ? -n : n, ambiguous };
}

export const toNum = (v: unknown): number | null => parseNum(v).n;
