// ============================================================
// تنبيه نسبة الضريبة (معلوماتي فقط، استرشادي): النسبة الضمنية = الضريبة ÷ المجموع الفرعي
// تُقارَن بالنسبة القياسية لبلد المستخدم المدوَّنة في data/countries.ts؛ لا تُجرى المقارنة لفاتورة بعملة أجنبية
// ============================================================
import { parseNum } from './numbers';
import { STANDARD_VAT } from '../data/countries';

export type VatAdvisory = { code: 'vat'; implied: number; rates: number[] };

export function vatAdvisory(o: any, countryCode: string, localCur: string): VatAdvisory | null {
  const rates = STANDARD_VAT[countryCode];
  const cur = String(o?.currency ?? '').trim().toUpperCase();
  if (!rates || (cur && cur !== localCur)) return null; // عملة أجنبية: نظام ضريبي آخر غالباً
  const sub = parseNum(o?.subtotal, 'en'), tax = parseNum(o?.tax, 'en');
  if (sub.n == null || tax.n == null || sub.ambiguous || tax.ambiguous || sub.n <= 0 || tax.n <= 0) return null;
  const implied = Math.round((tax.n / sub.n) * 1000) / 10;
  return rates.some((r) => Math.abs(implied - r) <= 0.6) ? null : { code: 'vat', implied, rates };
}
