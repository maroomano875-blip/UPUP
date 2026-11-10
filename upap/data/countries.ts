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
  C('DE', 'ألمانيا', '🇩🇪', 'EUR', 'de-DE', 'MwSt 19%', 'ltr', 'Europe/Berlin', ['GDPR', 'EU AI Act'], ['de', 'en-GB']),
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
  C('IT', 'إيطاليا', '🇮🇹', 'EUR', 'it-IT', 'IVA 22%', 'ltr', 'Europe/Rome', ['GDPR', 'EU AI Act'], ['it', 'en-GB']),
  C('IN', 'الهند', '🇮🇳', 'INR', 'en-IN', 'GST 5-28%', 'ltr', 'Asia/Kolkata', ['DPDP Act'], ['en-IN', 'hi']),
  C('PK', 'باكستان', '🇵🇰', 'PKR', 'ur-PK', 'ضريبة مبيعات 18%', 'rtl', 'Asia/Karachi', ['—'], ['ur', 'en-GB']),
  C('ID', 'إندونيسيا', '🇮🇩', 'IDR', 'id-ID', 'PPN 11-12%', 'ltr', 'Asia/Jakarta', ['UU PDP'], ['id', 'en-US']),
  C('BR', 'البرازيل', '🇧🇷', 'BRL', 'pt-BR', 'ICMS / ISS', 'ltr', 'America/Sao_Paulo', ['LGPD'], ['pt-BR', 'en-US']),
];

export const LANGUAGES: Record<string, string> = {
  'ar': 'العربية (فصحى)', 'ar-SA': 'العربية — السعودية', 'ar-EG': 'العربية — مصر', 'ar-SY': 'العربية — سوريا',
  'en-US': 'English (US)', 'en-GB': 'English (UK)', 'fr': 'Français', 'es': 'Español', 'tr': 'Türkçe',
  'de': 'Deutsch', 'it': 'Italiano', 'pt-BR': 'Português (Brasil)', 'id': 'Bahasa Indonesia',
  'hi': 'हिन्दी', 'ur': 'اردو', 'en-IN': 'English (India)',
};
export const VOLATILE = ['SYP', 'LBP', 'EGP', 'TRY', 'YER', 'IQD'];
export const getCountry = (code: string) => COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[0];

export function fmtMoney(amount: number, c: Country) {
  try { return new Intl.NumberFormat(c.locale, { style: 'currency', currency: c.currency }).format(amount); }
  catch { return `${amount.toLocaleString()} ${c.currency}`; }
}

// فحوصات امتثال خفيفة تُعرض في الواجهة (القواعد الكاملة تُنفَّذ داخل الوكلاء).
export interface Check { severity: 'blocker' | 'warning' | 'info'; text: string }
type L3 = 'ar' | 'en' | 'fr';
const L = (lang: L3, ar: string, en: string, fr: string) => (lang === 'ar' ? ar : lang === 'fr' ? fr : en);
export function complianceChecks(c: Country, professionSlug: string, lang: L3 = 'ar'): Check[] {
  const out: Check[] = [];
  out.push({ severity: 'info', text: L(lang, 'نسب الضرائب والأنظمة المعروضة إرشادية، وتُراجع مع جهة مختصة قبل الاعتماد.', 'Tax rates and regulations shown are indicative and should be checked with a specialist before relying on them.', 'Les taux d’imposition et réglementations affichés sont indicatifs et doivent être vérifiés auprès d’un spécialiste.') });
  if (c.restricted) out.push({ severity: 'warning', text: L(lang, 'قيود على الدفع الدولي في هذا البلد — الاشتراك يتم بعملة USDT/TRC20.', 'International payments are restricted in this country — subscription is paid in USDT/TRC20.', 'Les paiements internationaux sont restreints dans ce pays — l’abonnement se règle en USDT/TRC20.') });
  if (VOLATILE.includes(c.currency)) out.push({ severity: 'info', text: L(lang, `عملة ${c.currency} متقلبة؛ تُعرض المبالغ كما وردت دون تحويل تلقائي.`, `The ${c.currency} currency is volatile; amounts are shown as received, without automatic conversion.`, `La devise ${c.currency} est volatile ; les montants sont affichés tels quels, sans conversion automatique.`) });
  if (c.regs.some((r) => /GDPR|AI Act/.test(r))) out.push({ severity: 'info', text: L(lang, 'لا تُرفع بيانات شخصية دون أساس قانوني؛ سجل التدقيق مفعّل لكل طلب.', 'Do not upload personal data without a legal basis; the audit log is on for every request.', 'Ne téléversez pas de données personnelles sans base légale ; le journal d’audit est actif pour chaque demande.') });
  if (professionSlug === 'medicine' && c.regs.includes('HIPAA')) out.push({ severity: 'blocker', text: L(lang, 'البيانات الصحية المحمية (PHI) تتطلب اتفاقية BAA — الوكيل غير متاح بعد.', 'Protected health information (PHI) requires a BAA — the agent is not available yet.', 'Les données de santé protégées (PHI) exigent un accord BAA — l’agent n’est pas encore disponible.') });
  if (['law', 'medicine', 'insurance'].includes(professionSlug)) out.push({ severity: 'warning', text: L(lang, 'المخرجات مساعدة مهنية وليست رأياً نهائياً؛ المراجعة البشرية مطلوبة قبل الاعتماد.', 'Outputs are professional aid, not a final opinion; human review is required before relying on them.', 'Les résultats sont une aide professionnelle et non un avis définitif ; une relecture humaine est requise avant toute décision.') });
  if (professionSlug === 'accounting' && c.code === 'SA') out.push({ severity: 'info', text: L(lang, 'تحقق من متطلبات الفوترة الإلكترونية (ZATCA) عند الإصدار.', 'Check the e-invoicing (ZATCA) requirements when issuing.', 'Vérifiez les exigences de facturation électronique (ZATCA) lors de l’émission.') });
  return out;
}
