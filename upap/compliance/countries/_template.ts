// ==========================================================
// قالب إعدادات الدولة — انسخه لإضافة دولة جديدة
// ==========================================================
import { CountryConfig } from "../../core/types/country";

export const TEMPLATE_COUNTRY: CountryConfig = {
  code: "XX",
  name_ar: "اسم الدولة بالعربية",
  name_en: "Country Name",
  flag: "🏳️",
  currency: "XXX",
  currency_symbol: "X",
  languages: ["en"],
  primary_language: "en",
  text_direction: "ltr",
  tax_system: "vat",
  tax_rates: { standard: 0 },
  regulations: [],
  date_format: "DD/MM/YYYY",
  number_format: "1,234.56",
  timezone: "UTC",
  business_hours: { start: "09:00", end: "17:00" },
  invoice_fields: {
    tax_id_label: "Tax ID",
    required_fields: ["vendor_name", "invoice_number", "invoice_date", "total"],
  },
};
