// مسار الوكيل: المنطق المشترك في lib/agentRoute.ts (حد الحجم، التحقق من المدخلات، رسائل خطأ عامة)
import { makeAgentRoute } from "../../../../lib/agentRoute";
import { CAMPAIGN_REVIEWER_CONFIG } from "../../../../professions/marketing/agents/campaign-reviewer/agent.config";

export const POST = makeAgentRoute(CAMPAIGN_REVIEWER_CONFIG, "campaign-reviewer");
