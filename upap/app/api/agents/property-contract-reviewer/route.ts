// مسار الوكيل: المنطق المشترك في lib/agentRoute.ts (حد الحجم، التحقق من المدخلات، رسائل خطأ عامة)
import { makeAgentRoute } from "../../../../lib/agentRoute";
import { PROPERTY_CONTRACT_REVIEWER_CONFIG } from "../../../../professions/real_estate/agents/property-contract-reviewer/agent.config";

export const POST = makeAgentRoute(PROPERTY_CONTRACT_REVIEWER_CONFIG, "property-contract-reviewer");
