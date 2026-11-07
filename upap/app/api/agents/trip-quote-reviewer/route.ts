// مسار الوكيل: المنطق المشترك في lib/agentRoute.ts (حد الحجم، التحقق من المدخلات، رسائل خطأ عامة)
import { makeAgentRoute } from "../../../../lib/agentRoute";
import { TRIP_QUOTE_REVIEWER_CONFIG } from "../../../../professions/tourism/agents/trip-quote-reviewer/agent.config";

export const POST = makeAgentRoute(TRIP_QUOTE_REVIEWER_CONFIG, "trip-quote-reviewer");
