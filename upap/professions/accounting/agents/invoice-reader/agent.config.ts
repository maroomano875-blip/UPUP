// ==========================================================
// وكيل قراءة الفواتير — أول وكيل فعلي على المنصة
// ==========================================================
import { AgentConfig } from "../../../../core/types/agent";
import { INVOICE_READER_SYSTEM_PROMPT } from "./agent.prompt";

export const INVOICE_READER_CONFIG: AgentConfig = {
  id: "accounting.invoice-reader",
  name: "Invoice Reader",
  name_ar: "قارئ الفواتير",
  profession: "accounting",
  type: "invoice-reader",
  version: "1.0.0",
  status: "active",

  supported_countries: [
    "US", "GB", "FR", "DE", "ES", "IT", "SA", "AE", "EG", "SY", "JO", "LB", "MA", "DZ",
    "IQ", "KW", "QA", "BH", "OM", "YE", "TR", "CA", "AU", "IN", "PK", "ID", "BR",
  ],
  supported_languages: [
    "en-US", "en-GB", "en-IN", "ar", "ar-SA", "ar-EG", "ar-SY",
    "fr", "es", "tr", "de", "it", "pt-BR", "id", "hi", "ur",
  ],
  supported_currencies: ["USD", "GBP", "EUR", "SAR", "AED", "EGP", "SYP", "JOD", "LBP", "MAD", "DZD", "IQD", "KWD", "QAR", "BHD", "OMR", "YER", "TRY", "CAD", "AUD", "INR", "PKR", "IDR", "BRL"],

  input_types: ["pdf", "image", "text"],
  output_schema: {},

  confidence_threshold: 0.7,
  requires_human_approval: false,
  max_processing_time_ms: 45000,
  cost_per_request_usd: 0,

  system_prompt_template: INVOICE_READER_SYSTEM_PROMPT,
  tools: ["ocrPDF", "calculateTotal", "validateTaxId"],
  knowledge_base_ids: [],
};
