// مسار الوكيل: المنطق المشترك في lib/agentRoute.ts (حد الحجم، التحقق من المدخلات، رسائل خطأ عامة)
import { makeAgentRoute } from "../../../../lib/agentRoute";
import { PRODUCTION_REPORT_REVIEWER_CONFIG } from "../../../../professions/industry/agents/production-report-reviewer/agent.config";

export const POST = makeAgentRoute(PRODUCTION_REPORT_REVIEWER_CONFIG, "production-report-reviewer");
