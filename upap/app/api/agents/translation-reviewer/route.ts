// مسار الوكيل: المنطق المشترك في lib/agentRoute.ts (حد الحجم، التحقق من المدخلات، رسائل خطأ عامة)
import { makeAgentRoute } from "../../../../lib/agentRoute";
import { TRANSLATION_REVIEWER_CONFIG } from "../../../../professions/translation/agents/translation-reviewer/agent.config";

export const POST = makeAgentRoute(TRANSLATION_REVIEWER_CONFIG, "translation-reviewer");
