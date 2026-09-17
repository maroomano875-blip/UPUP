// ==========================================================
// هيكل بيانات الدولة — يُستخدم في طبقة الامتثال
// ==========================================================

export type TaxSystem =
  | "vat"         // ضريبة القيمة المضافة (أوروبا، الخليج)
  | "sales_tax"   // ضريبة المبيعات (أمريكا)
  | "gst"         // ضريبة السلع والخدمات (أستراليا، كندا)
  | "none";       // لا ضريبة

export type RegulationCode =
  | "gdpr"        // الاتحاد الأوروبي
  | "hipaa"       // الرعاية الصحية الأمريكية
  | "ccpa"        // كاليفورنيا
  | "sox"         // الأسواق المالية الأمريكية
  | "pdpl"        // حماية البيانات الشخصية (السعودية)
  | "eu_ai_act"   // قانون الذكاء الاصطناعي الأوروبي
  | "difc"        // مركز دبي المالي الدولي
  | "adgm";       // سوق أبوظبي العالمي

export interface CountryConfig {
  code: string;                   // رمز ISO: US, GB, SA, SY...
  name_ar: string;
  name_en: string;
  flag: string;                   // إيموجي علم البلد
  currency: string;               // رمز العملة: USD, SAR, SYP...
  currency_symbol: string;        // رمز مختصر: $, ر.س, ل.س...
  languages: string[];            // اللغات المدعومة بالترتيب
  primary_language: string;
  text_direction: "rtl" | "ltr";
  tax_system: TaxSystem;
  tax_rates: Record<string, number | string>;
  regulations: RegulationCode[];
  date_format: string;            // MM/DD/YYYY أو DD/MM/YYYY أو YYYY-MM-DD
  number_format: string;          // 1,234.56 أو 1.234,56
  timezone: string;               // مثال: America/New_York
  business_hours: { start: string; end: string };
  // حقول الفواتير الخاصة بكل دولة
  invoice_fields: {
    tax_id_label: string;         // VAT Number / Tax ID / رقم ضريبي
    tax_id_format?: string;       // تنسيق regex للتحقق
    required_fields: string[];    // الحقول الإلزامية قانونياً
  };
}
