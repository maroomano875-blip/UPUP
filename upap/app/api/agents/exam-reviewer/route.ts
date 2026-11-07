// مسار الوكيل: المنطق المشترك في lib/agentRoute.ts (حد الحجم، التحقق من المدخلات، رسائل خطأ عامة)
import { makeAgentRoute } from "../../../../lib/agentRoute";
import { EXAM_REVIEWER_CONFIG } from "../../../../professions/education/agents/exam-reviewer/agent.config";

export const POST = makeAgentRoute(EXAM_REVIEWER_CONFIG, "exam-reviewer");
