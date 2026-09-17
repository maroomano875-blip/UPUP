// ==========================================================
// قالب إعدادات وكيل جديد — انسخ هذا المجلد كاملاً لبناء وكيل جديد
// مثال: cp -r agentTemplate professions/law/agents/contract-reviewer
// ==========================================================
import { AgentConfig } from "../../types/agent";

export const TEMPLATE_AGENT_CONFIG: AgentConfig = {
  id: "profession-slug.agent-type",       // مثال: accounting.invoice-reader
  name: "Agent Name",
  name_ar: "اسم الوكيل بالعربية",
  profession: "profession-slug",           // يطابق professions.slug
  type: "agent-type",
  version: "0.1.0",
  status: "coming_soon",

  supported_countries: ["US"],
  supported_languages: ["en-US"],
  supported_currencies: ["USD"],

  input_types: ["pdf", "image", "text"],
  output_schema: {},                       // اربطه بمخطط Zod من validators/schema.ts

  confidence_threshold: 0.75,
  requires_human_approval: false,
  max_processing_time_ms: 30000,
  cost_per_request_usd: 0,                 // 0 لأن المزودين مجانيون

  system_prompt_template: "استبدل هذا ببرومبت الوكيل الفعلي. يدعم {country} {language} {context}",
  tools: [],
  knowledge_base_ids: [],
};
