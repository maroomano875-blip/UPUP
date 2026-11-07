// مسار الوكيل: المنطق المشترك في lib/agentRoute.ts (حد الحجم، التحقق من المدخلات، رسائل خطأ عامة)
import { makeAgentRoute } from "../../../../lib/agentRoute";
import { DESIGN_QUOTE_REVIEWER_CONFIG } from "../../../../professions/design/agents/design-quote-reviewer/agent.config";

export const POST = makeAgentRoute(DESIGN_QUOTE_REVIEWER_CONFIG, "design-quote-reviewer");
