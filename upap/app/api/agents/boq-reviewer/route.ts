// مسار الوكيل: المنطق المشترك في lib/agentRoute.ts (حد الحجم، التحقق من المدخلات، رسائل خطأ عامة)
import { makeAgentRoute } from "../../../../lib/agentRoute";
import { BOQ_REVIEWER_CONFIG } from "../../../../professions/engineering/agents/boq-reviewer/agent.config";

export const POST = makeAgentRoute(BOQ_REVIEWER_CONFIG, "boq-reviewer");
