import { getCountry } from '../data/countries';

// سياق التاريخ حسب الدولة: تاريخ اليوم بتوقيتها وترتيب اليوم/الشهر/السنة في مستنداتها
export function countryDateContext(code: string, now: Date = new Date()): string {
  const c = getCountry(code);
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: c.tz }).format(now);
  const order = new Intl.DateTimeFormat(`${c.locale}-u-ca-gregory-nu-latn`, { year: 'numeric', month: '2-digit', day: '2-digit' })
    .formatToParts(now)
    .filter((p) => p.type === 'day' || p.type === 'month' || p.type === 'year')
    .map((p) => p.type)
    .join('/');
  return `Today is ${today} (${c.tz}). Numeric dates in documents from ${c.code} are normally written ${order}; read ambiguous dates such as 03/04/2025 that way. Some documents use the Hijri calendar: if so, convert carefully to Gregorian and add a warning. Only call a date "in the future" if it is later than today.`;
}
