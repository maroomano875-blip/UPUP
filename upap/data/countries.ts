// 22 دولة: العملة، النظام الضريبي، اللوائح، وقيود الدفع (→ USDT).
export interface Country {
  code: string; name_ar: string; flag: string; currency: string; locale: string;
  tax: string; dir: 'rtl' | 'ltr'; tz: string; regs: string[]; restricted: boolean;
  languages: string[];
}
const C = (code: string, name_ar: string, flag: string, currency: string, locale: string, tax: string,
  dir: 'rtl' | 'ltr', tz: string, regs: string[], languages: string[], restricted = false): Country =>
  ({ code, name_ar, flag, currency, locale, tax, dir, tz, regs, restricted, languages });

export const COUNTRIES: Country[] = [
  C('US', 'الولايات المتحدة', '🇺🇸', 'USD', 'en-US', 'Sales Tax / IRS', 'ltr', 'America/New_York', ['HIPAA', 'CCPA'], ['en-US']),
  C('GB', 'المملكة المتحدة', '🇬🇧', 'GBP', 'en-GB', 'VAT 20%', 'ltr', 'Europe/London', ['UK GDPR'], ['en-GB']),
  C('FR', 'فرنسا', '🇫🇷', 'EUR', 'fr-FR', 'TVA 20%', 'ltr', 'Europe/Paris', ['GDPR', 'EU AI Act'], ['fr', 'en-GB']),
  C('DE', 'ألمانيا', '🇩🇪', 'EUR', 'de-DE', 'MwSt 19%', 'ltr', 'Europe/Berlin', ['GDPR', 'EU AI Act'], ['en-GB']),
  C('ES', 'إسبانيا', '🇪🇸', 'EUR', 'es-ES', 'IVA 21%', 'ltr', 'Europe/Madrid', ['GDPR', 'EU AI Act'], ['es', 'en-GB']),
  C('SA', 'السعودية', '🇸🇦', 'SAR', 'ar-SA', 'VAT 15% / ZATCA', 'rtl', 'Asia/Riyadh', ['PDPL-SA'], ['ar-SA', 'ar', 'en-US']),
  C('AE', 'الإمارات', '🇦🇪', 'AED', 'ar-AE', 'VAT 5%', 'rtl', 'Asia/Dubai', ['PDPL-AE'], ['ar', 'en-US']),
  C('EG', 'مصر', '🇪🇬', 'EGP', 'ar-EG', 'VAT 14% / الفاتورة الإلكترونية', 'rtl', 'Africa/Cairo', ['PDPL-EG'], ['ar-EG', 'ar', 'en-US']),
  C('SY', 'سوريا', '🇸🇾', 'SYP', 'ar-SY', 'ضريبة دخل / رسوم', 'rtl', 'Asia/Damascus', ['قانون حماية البيانات (قيد الإعداد)'], ['ar-SY', 'ar'], true),
  C('JO', 'الأردن', '🇯🇴', 'JOD', 'ar-JO', 'ضريبة مبيعات 16%', 'rtl', 'Asia/Amman', ['PDPL-JO'], ['ar', 'en-US']),
  C('LB', 'لبنان', '🇱🇧', 'LBP', 'ar-LB', 'TVA 11%', 'rtl', 'Asia/Beirut', ['قانون المعاملات الإلكترونية'], ['ar', 'fr'], true),
  C('MA', 'المغرب', '🇲🇦', 'MAD', 'ar-MA', 'TVA 20%', 'rtl', 'Africa/Casablanca', ['Loi 09-08'], ['ar', 'fr']),
  C('DZ', 'الجزائر', '🇩🇿', 'DZD', 'ar-DZ', 'TVA 19%', 'rtl', 'Africa/Algiers', ['Loi 18-07'], ['ar', 'fr']),
  C('IQ', 'العراق', '🇮🇶', 'IQD', 'ar-IQ', 'ضريبة دخل', 'rtl', 'Asia/Baghdad', ['—'], ['ar'], true),
  C('KW', 'الكويت', '🇰🇼', 'KWD', 'ar-KW', 'بدون VAT حالياً', 'rtl', 'Asia/Kuwait', ['CITRA'], ['ar', 'en-US']),
  C('QA', 'قطر', '🇶🇦', 'QAR', 'ar-QA', 'بدون VAT حالياً', 'rtl', 'Asia/Qatar', ['PDPPL'], ['ar', 'en-US']),
  C('BH', 'البحرين', '🇧🇭', 'BHD', 'ar-BH', 'VAT 10%', 'rtl', 'Asia/Bahrain', ['PDPL-BH'], ['ar', 'en-US']),
  C('OM', 'عُمان', '🇴🇲', 'OMR', 'ar-OM', 'VAT 5%', 'rtl', 'Asia/Muscat', ['PDPL-OM'], ['ar', 'en-US']),
  C('YE', 'اليمن', '🇾🇪', 'YER', 'ar-YE', 'ضريبة مبيعات', 'rtl', 'Asia/Aden', ['—'], ['ar'], true),
  C('TR', 'تركيا', '🇹🇷', 'TRY', 'tr-TR', 'KDV 20% / e-Fatura', 'ltr', 'Europe/Istanbul', ['KVKK'], ['tr', 'en-US']),
  C('CA', 'كندا', '🇨🇦', 'CAD', 'en-CA', 'GST/HST', 'ltr', 'America/Toronto', ['PIPEDA'], ['en-US', 'fr']),
  C('AU', 'أستراليا', '🇦🇺', 'AUD', 'en-AU', 'GST 10%', 'ltr', 'Australia/Sydney', ['Privacy Act'], ['en-GB']),
];

export const LANGUAGES: Record<string, string> = {
  'ar': 'العربية (فصحى)', 'ar-SA': 'العربية — السعودية', 'ar-EG': 'العربية — مصر', 'ar-SY': 'العربية — سوريا',
  'en-US': 'English (US)', 'en-GB': 'English (UK)', 'fr': 'Français', 'es': 'Español', 'tr': 'Türkçe',
};
export const VOLATILE = ['SYP', 'LBP', 'EGP', 'TRY', 'YER', 'IQD'];
export const getCountry = (code: string) => COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[0];

export function fmtMoney(amount: number, c: Country) {
  try { return new Intl.NumberFormat(c.locale, { style: 'currency', currency: c.currency }).format(amount); }
  catch { return `${amount.toLocaleString()} ${c.currency}`; }
}

// فحوصات امتثال خفيفة تُعرض في الواجهة (القواعد الكاملة تُنفَّذ داخل الوكلاء).
export interface Check { severity: 'blocker' | 'warning' | 'info'; text: string }
export function complianceChecks(c: Country, professionSlug: string): Check[] {
  const out: Check[] = [];
  if (c.restricted) out.push({ severity: 'warning', text: 'قيود على الدفع الدولي في هذا البلد — الاشتراك يتم بعملة USDT/TRC20.' });
  if (VOLATILE.includes(c.currency)) out.push({ severity: 'info', text: `عملة ${c.currency} متقلبة؛ تُعرض المبالغ كما وردت دون تحويل تلقائي.` });
  if (c.regs.some((r) => /GDPR|AI Act/.test(r))) out.push({ severity: 'info', text: 'لا تُرفع بيانات شخصية دون أساس قانوني؛ سجل التدقيق مفعّل لكل طلب.' });
  if (professionSlug === 'medicine' && c.regs.includes('HIPAA')) out.push({ severity: 'blocker', text: 'البيانات الصحية المحمية (PHI) تتطلب اتفاقية BAA — الوكيل غير متاح بعد.' });
  if (['law', 'medicine', 'insurance'].includes(professionSlug)) out.push({ severity: 'warning', text: 'المخرجات مساعدة مهنية وليست رأياً نهائياً؛ المراجعة البشرية مطلوبة قبل الاعتماد.' });
  if (professionSlug === 'accounting' && c.code === 'SA') out.push({ severity: 'info', text: 'تحقق من متطلبات الفوترة الإلكترونية (ZATCA) عند الإصدار.' });
  return out;
}
