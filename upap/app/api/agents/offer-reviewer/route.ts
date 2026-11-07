// مسار الوكيل: المنطق المشترك في lib/agentRoute.ts (حد الحجم، التحقق من المدخلات، رسائل خطأ عامة)
import { makeAgentRoute } from "../../../../lib/agentRoute";
import { OFFER_REVIEWER_CONFIG } from "../../../../professions/hr/agents/offer-reviewer/agent.config";

export const POST = makeAgentRoute(OFFER_REVIEWER_CONFIG, "offer-reviewer");
