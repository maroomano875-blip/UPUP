import { CountryConfig } from "../../core/types/country";

export const SA: CountryConfig = {
  code: "SA",
  name_ar: "المملكة العربية السعودية",
  name_en: "Saudi Arabia",
  flag: "🇸🇦",
  currency: "SAR",
  currency_symbol: "ر.س",
  languages: ["ar-SA", "en"],
  primary_language: "ar-SA",
  text_direction: "rtl",
  tax_system: "vat",
  tax_rates: { vat: 0.15 },
  regulations: ["pdpl"],
  date_format: "DD/MM/YYYY",
  number_format: "1,234.56",
  timezone: "Asia/Riyadh",
  business_hours: { start: "08:00", end: "16:00" },
  invoice_fields: {
    tax_id_label: "الرقم الضريبي (VAT)",
    tax_id_format: "^3\\d{14}$",
    required_fields: [
      "vendor_name", "vendor_vat_number", "invoice_number",
      "invoice_date", "subtotal", "tax", "total",
    ],
  },
};
