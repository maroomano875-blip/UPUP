// مسار الوكيل: المنطق المشترك في lib/agentRoute.ts (حد الحجم، التحقق من المدخلات، رسائل خطأ عامة)
import { makeAgentRoute } from "../../../../lib/agentRoute";
import { ENGAGEMENT_LETTER_REVIEWER_CONFIG } from "../../../../professions/consulting/agents/engagement-letter-reviewer/agent.config";

export const POST = makeAgentRoute(ENGAGEMENT_LETTER_REVIEWER_CONFIG, "engagement-letter-reviewer");
