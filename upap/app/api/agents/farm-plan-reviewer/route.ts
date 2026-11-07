// مسار الوكيل: المنطق المشترك في lib/agentRoute.ts (حد الحجم، التحقق من المدخلات، رسائل خطأ عامة)
import { makeAgentRoute } from "../../../../lib/agentRoute";
import { FARM_PLAN_REVIEWER_CONFIG } from "../../../../professions/agriculture/agents/farm-plan-reviewer/agent.config";

export const POST = makeAgentRoute(FARM_PLAN_REVIEWER_CONFIG, "farm-plan-reviewer");
