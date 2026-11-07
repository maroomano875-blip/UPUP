// مسار الوكيل: المنطق المشترك في lib/agentRoute.ts (حد الحجم، التحقق من المدخلات، رسائل خطأ عامة)
import { makeAgentRoute } from "../../../../lib/agentRoute";
import { CONTRACT_REVIEWER_CONFIG } from "../../../../professions/law/agents/contract-reviewer/agent.config";

export const POST = makeAgentRoute(CONTRACT_REVIEWER_CONFIG, "contract-reviewer");
