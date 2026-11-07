// مسار الوكيل: المنطق المشترك في lib/agentRoute.ts (حد الحجم، التحقق من المدخلات، رسائل خطأ عامة)
import { makeAgentRoute } from "../../../../lib/agentRoute";
import { SUBCONTRACT_REVIEWER_CONFIG } from "../../../../professions/contracting/agents/subcontract-reviewer/agent.config";

export const POST = makeAgentRoute(SUBCONTRACT_REVIEWER_CONFIG, "subcontract-reviewer");
