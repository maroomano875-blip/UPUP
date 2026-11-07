// مسار الوكيل: المنطق المشترك في lib/agentRoute.ts (حد الحجم، التحقق من المدخلات، رسائل خطأ عامة)
import { makeAgentRoute } from "../../../../lib/agentRoute";
import { LAB_SUMMARIZER_CONFIG } from "../../../../professions/medicine/agents/lab-summarizer/agent.config";

export const POST = makeAgentRoute(LAB_SUMMARIZER_CONFIG, "lab-summarizer");
