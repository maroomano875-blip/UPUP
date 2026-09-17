import { CountryConfig } from "../../core/types/country";

export const SY: CountryConfig = {
  code: "SY",
  name_ar: "الجمهورية العربية السورية",
  name_en: "Syria",
  flag: "🇸🇾",
  currency: "SYP",
  currency_symbol: "ل.س",
  languages: ["ar-SY", "ar", "en"],
  primary_language: "ar-SY",
  text_direction: "rtl",
  tax_system: "vat",
  tax_rates: { vat: 0.11 },
  regulations: [],
  date_format: "DD/MM/YYYY",
  number_format: "1.234,56",
  timezone: "Asia/Damascus",
  business_hours: { start: "08:00", end: "15:00" },
  invoice_fields: {
    tax_id_label: "الرقم الضريبي",
    required_fields: ["vendor_name", "invoice_number", "invoice_date", "total"],
  },
};
