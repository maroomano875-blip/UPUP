// ============================================================
// وكيل ملخّص التقارير الطبية — الإعدادات
// ============================================================
import { AgentConfig } from "../../../../core/types/agent";
import { LAB_SUMMARIZER_SYSTEM_PROMPT } from "./agent.prompt";

export const LAB_SUMMARIZER_CONFIG: AgentConfig = {
  id: "medicine.lab-summarizer",
  name: "Medical Report Summarizer",
  name_ar: "ملخّص التقارير الطبية",
  profession: "medicine" as unknown as AgentConfig["profession"],
  type: "lab-summarizer" as unknown as AgentConfig["type"],
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
  supported_currencies: [],

  input_types: ["pdf", "image", "text"],
  output_schema: {},

  // تلخيص طبي: موافقة بشرية دائماً وحد ثقة مرتفع
  confidence_threshold: 0.8,
  requires_human_approval: true,
  max_processing_time_ms: 60000,
  cost_per_request_usd: 0,

  system_prompt_template: LAB_SUMMARIZER_SYSTEM_PROMPT,
  tools: ["ocrPDF"],
  knowledge_base_ids: [],
};
