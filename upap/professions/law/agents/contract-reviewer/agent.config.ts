// ==========================================================
// وكيل مراجعة العقود — ثاني وكيل فعلي على المنصة
// ==========================================================
import { AgentConfig } from "../../../../core/types/agent";
import { CONTRACT_REVIEWER_SYSTEM_PROMPT } from "./agent.prompt";

export const CONTRACT_REVIEWER_CONFIG: AgentConfig = {
  id: "law.contract-reviewer",
  name: "Contract Reviewer",
  name_ar: "مراجع العقود",
  profession: "law",
  type: "contract-reviewer",
  version: "1.0.0",
  status: "active",

  supported_countries: ["US", "GB", "SA", "AE", "EG", "SY"],
  supported_languages: ["en-US", "en-GB", "ar", "ar-SA", "ar-EG", "ar-SY"],
  supported_currencies: [],

  input_types: ["pdf", "image", "text"],
  output_schema: {},

  // العقود تحتاج ثقة أعلى وتتطلب مراجعة بشرية دائماً — القرار هون أخطر من فاتورة
  confidence_threshold: 0.8,
  requires_human_approval: true,
  max_processing_time_ms: 60000,
  cost_per_request_usd: 0,

  system_prompt_template: CONTRACT_REVIEWER_SYSTEM_PROMPT,
  tools: ["ocrPDF"],
  knowledge_base_ids: [],
};
