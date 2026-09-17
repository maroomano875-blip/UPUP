import { CountryConfig } from "../../core/types/country";

export const US: CountryConfig = {
  code: "US",
  name_ar: "الولايات المتحدة الأمريكية",
  name_en: "United States",
  flag: "🇺🇸",
  currency: "USD",
  currency_symbol: "$",
  languages: ["en-US", "es"],
  primary_language: "en-US",
  text_direction: "ltr",
  tax_system: "sales_tax",
  tax_rates: { federal_corporate: 0.21, state: "varies_by_state" },
  regulations: ["hipaa", "ccpa", "sox"],
  date_format: "MM/DD/YYYY",
  number_format: "1,234.56",
  timezone: "America/New_York",
  business_hours: { start: "09:00", end: "17:00" },
  invoice_fields: {
    tax_id_label: "EIN / Tax ID",
    tax_id_format: "^\\d{2}-\\d{7}$",
    required_fields: ["vendor_name", "invoice_number", "invoice_date", "total", "payment_terms"],
  },
};
