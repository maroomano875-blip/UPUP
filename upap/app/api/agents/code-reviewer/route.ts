// مسار الوكيل: المنطق المشترك في lib/agentRoute.ts (حد الحجم، التحقق من المدخلات، رسائل خطأ عامة)
import { makeAgentRoute } from "../../../../lib/agentRoute";
import { CODE_REVIEWER_CONFIG } from "../../../../professions/programming/agents/code-reviewer/agent.config";

export const POST = makeAgentRoute(CODE_REVIEWER_CONFIG, "code-reviewer");
