// مسار الوكيل: المنطق المشترك في lib/agentRoute.ts (حد الحجم، التحقق من المدخلات، رسائل خطأ عامة)
import { makeAgentRoute } from "../../../../lib/agentRoute";
import { POLICY_REVIEWER_CONFIG } from "../../../../professions/insurance/agents/policy-reviewer/agent.config";

export const POST = makeAgentRoute(POLICY_REVIEWER_CONFIG, "policy-reviewer");
