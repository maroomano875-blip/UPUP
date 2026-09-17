// ==========================================================
// أنواع TypeScript الخاصة بالوكلاء — نواة النظام
// ==========================================================

export type InputType = "pdf" | "image" | "text" | "audio" | "json";
export type AgentStatus = "active" | "beta" | "maintenance" | "coming_soon";
export type RequestStatus =
  | "received"
  | "parsing"
  | "processing"
  | "reviewing"
  | "delivered"
  | "failed"
  | "needs_human";

// ── إعدادات الوكيل الكاملة ────────────────────────────────
export interface AgentConfig {
  id: string;                         // معرف فريد: profession.type (مثل: accounting.invoice-reader)
  name: string;                       // اسم بالإنجليزية
  name_ar: string;                    // اسم بالعربية
  profession: string;                 // slug المهنة (accounting, law, medicine...)
  type: string;                       // نوع المهمة (invoice-reader, contract-reviewer...)
  version: string;                    // رقم الإصدار
  status: AgentStatus;

  // الدعم الجغرافي واللغوي
  supported_countries: string[];      // ["US", "GB", "SA", "AE", "EG", "SY"...]
  supported_languages: string[];      // ["en-US", "en-GB", "ar", "ar-SA", "ar-EG"...]
  supported_currencies: string[];     // ["USD", "EUR", "GBP", "SAR", "AED"...]

  // المدخلات والمخرجات
  input_types: InputType[];
  output_schema: Record<string, unknown>; // Zod schema serialized

  // جودة وأمان
  confidence_threshold: number;       // أقل من هذا → مراجعة بشرية إلزامية
  requires_human_approval: boolean;   // هل يحتاج موافقة بشرية في كل الأحوال؟
  max_processing_time_ms: number;     // حد زمني للمعالجة (يفشل إن تجاوزه)
  cost_per_request_usd: number;       // تكلفة الطلب الواحد (للتتبع الداخلي)

  // البرومبت والأدوات
  system_prompt_template: string;     // قالب البرومبت (يدعم {country}, {language}, {context})
  tools: string[];                    // أسماء الأدوات المتاحة لهذا الوكيل
  knowledge_base_ids: string[];       // معرفات قواعد المعرفة في Supabase Storage
}

// ── نتيجة تشغيل وكيل ─────────────────────────────────────
export interface AgentResult<T = Record<string, unknown>> {
  request_id: string;
  agent_id: string;
  status: RequestStatus;
  output: T;
  confidence_score: number;
  warnings: string[];
  processing_time_ms: number;
  provider_used: "openrouter" | "gemini";
  reviewer_notes?: string;
  needs_human_review: boolean;
}

// ── سجل الوكيل في registry ────────────────────────────────
export interface AgentRegistryEntry {
  config: AgentConfig;
  createdAt: Date;
  requestCount: number;
}
