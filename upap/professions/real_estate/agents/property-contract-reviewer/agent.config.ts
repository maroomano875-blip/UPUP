// ============================================================
// مراجع العقود العقارية — إعدادات الوكيل (مولَّد بواسطة scripts/new-agent.py)
// ============================================================
import { AgentConfig } from "../../../../core/types/agent";
import { PROPERTY_CONTRACT_REVIEWER_SYSTEM_PROMPT } from "./agent.prompt";

export const PROPERTY_CONTRACT_REVIEWER_CONFIG: AgentConfig = {
  id: "real_estate.property-contract-reviewer",
  name: "Real Estate Contract Reviewer",
  name_ar: "مراجع العقود العقارية",
  profession: "real_estate" as unknown as AgentConfig["profession"],
  type: "property-contract-reviewer" as unknown as AgentConfig["type"],
  version: "1.0.0",
  status: "active",

  supported_countries: [
    "US", "GB", "FR", "DE", "ES", "IT", "SA", "AE",
    "EG", "SY", "JO", "LB", "MA", "DZ",
    "IQ", "KW", "QA", "BH", "OM", "YE", "TR", "CA",
    "AU", "IN", "PK", "ID", "BR",
  ],
  supported_languages: [
    "en-US", "en-GB", "en-IN", "ar", "ar-SA", "ar-EG", "ar-SY",
    "fr", "es", "tr", "de", "it", "pt-BR", "id", "hi", "ur",
  ],
  supported_currencies: [],

  input_types: ["pdf", "image", "text"],
  output_schema: {},

  confidence_threshold: 0.8,
  requires_human_approval: true,
  max_processing_time_ms: 60000,
  cost_per_request_usd: 0,

  system_prompt_template: PROPERTY_CONTRACT_REVIEWER_SYSTEM_PROMPT,
  tools: ["ocrPDF"],
  knowledge_base_ids: [],
};
