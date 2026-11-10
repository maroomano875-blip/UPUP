// ============================================================
// التواريخ حسب تقويم الملف نفسه: هجري يُقارَن هجرياً وميلادي ميلادياً
// التحويل بين التقويمين فقط عند اختلافهما، مع هامش يوم واحد معلَن
// ============================================================
export type Cal = 'gregorian' | 'hijri' | 'unknown';
export type YMD = { y: number; m: number; d: number };
export type DateIssue = 'invalid' | 'mixedCal' | 'tolerance' | 'quoteMismatch' | 'ambiguous' | 'unknownCal';

const AR_DIGITS = /[٠-٩۰-۹]/g;
export const normDigits = (s: string) =>
  s.replace(AR_DIGITS, (c) => String((c.charCodeAt(0) >= 0x06f0 ? c.charCodeAt(0) - 0x06f0 : c.charCodeAt(0) - 0x0660)));

// قراءة YYYY-MM-DD (أو / أو .) بصرامة؛ أي شكل آخر = null
export function parseIso(v: unknown): YMD | null {
  const m = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/.exec(normDigits(String(v ?? '')).trim());
  return m ? { y: +m[1], m: +m[2], d: +m[3] } : null;
}

export const calOf = (y: number): Cal => (y >= 1300 && y <= 1600 ? 'hijri' : y >= 1900 && y <= 2200 ? 'gregorian' : 'unknown');

const dim = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();

// صلاحية التاريخ في تقويمه الحقيقي (30 يوماً حدٌّ أعلى لشهر هجري؛ الدقة الأعمق بالتحويل)
export function validYmd(p: YMD, cal: Cal): boolean {
  if (p.m < 1 || p.m > 12 || p.d < 1) return false;
  if (cal === 'gregorian') return p.d <= dim(p.y, p.m);
  if (cal === 'hijri') return p.d <= 30 && !!hijriToGregorian(p);
  return true;
}

const hFmt = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', { year: 'numeric', month: 'numeric', day: 'numeric', timeZone: 'UTC' });
function toHijri(ms: number): YMD {
  const o: Record<string, number> = {};
  for (const p of hFmt.formatToParts(new Date(ms))) if (p.type === 'year' || p.type === 'month' || p.type === 'day') o[p.type] = +p.value;
  return { y: o.year, m: o.month, d: o.day };
}

// هجري → ميلادي (UTC ms) بالبحث حول التقدير؛ null إن لم يوجد يوم بهذا التاريخ الهجري
export function hijriToGregorian(h: YMD): number | null {
  const yr = (h.y + (h.m - 1) / 12 + (h.d - 1) / 354) * 0.970224 + 621.5774;
  const guess = Date.UTC(Math.floor(yr), 0, 1) + (yr - Math.floor(yr)) * 365.2425 * 86400000;
  for (let k = -40; k <= 40; k++) {
    const ms = Math.round(guess / 86400000) * 86400000 + k * 86400000;
    const r = toHijri(ms);
    if (r.y === h.y && r.m === h.m && r.d === h.d) return ms;
  }
  return null;
}

export const gregorianMs = (p: YMD): number => Date.UTC(p.y, p.m - 1, p.d);
export const isoOf = (ms: number) => new Date(ms).toISOString().slice(0, 10);

// تواريخ رقمية داخل الاقتباس، بكل قراءاتها الممكنة
function quoteReadings(quote: string): YMD[][] {
  const out: YMD[][] = [];
  const re = /(\d{1,4})[/\-.](\d{1,2})[/\-.](\d{1,4})/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(normDigits(quote)))) {
    const [a, b, c] = [+m[1], +m[2], +m[3]];
    const r: YMD[] = [];
    if (m[1].length === 4) r.push({ y: a, m: b, d: c });
    else if (m[3].length === 4) { r.push({ y: c, m: b, d: a }); if (a !== b) r.push({ y: c, m: a, d: b }); }
    out.push(r.filter((x) => x.m >= 1 && x.m <= 12 && x.d >= 1 && x.d <= 31));
  }
  return out;
}
const same = (a: YMD, b: YMD) => a.y === b.y && a.m === b.m && a.d === b.d;

export type DateVerdict = {
  bad: boolean;
  cal: Cal | 'mixed';
  gStart?: string;
  gEnd?: string; // التحويل الميلادي يظهر فقط عند اختلاف التقويمين
  issues: DateIssue[];
};

export function judgeDates(start: unknown, end: unknown, quote?: unknown): DateVerdict {
  const a = parseIso(start), b = parseIso(end);
  const issues: DateIssue[] = [];
  const out: DateVerdict = { bad: false, cal: 'unknown', issues };
  if (!a || !b) return out;
  const ca = calOf(a.y), cb = calOf(b.y);
  const okA = validYmd(a, ca), okB = validYmd(b, cb);
  if (!okA || !okB) { issues.push('invalid'); return out; }
  if (ca === 'unknown' || cb === 'unknown') { issues.push('unknownCal'); }
  else if (ca === cb) {
    out.cal = ca;
    const ka = a.y * 10000 + a.m * 100 + a.d, kb = b.y * 10000 + b.m * 100 + b.d;
    out.bad = ka > kb;
  } else {
    out.cal = 'mixed';
    issues.push('mixedCal');
    const ma = ca === 'hijri' ? hijriToGregorian(a) : gregorianMs(a);
    const mb = cb === 'hijri' ? hijriToGregorian(b) : gregorianMs(b);
    if (ma != null && mb != null) {
      out.gStart = isoOf(ma); out.gEnd = isoOf(mb);
      const diff = (ma - mb) / 86400000; // >0 = البداية بعد النهاية
      if (diff > 1) out.bad = true;
      else if (diff > 0 || Math.abs(diff) <= 1) issues.push('tolerance');
    }
  }
  if (quote) {
    const rd = quoteReadings(String(quote));
    if (rd.length) {
      for (const p of [a, b]) {
        const hit = rd.find((r) => r.some((x) => same(x, p)));
        if (!hit) { if (!issues.includes('quoteMismatch')) issues.push('quoteMismatch'); }
        else if (hit.length > 1 && !issues.includes('ambiguous')) issues.push('ambiguous');
      }
    }
  }
  return out;
}
