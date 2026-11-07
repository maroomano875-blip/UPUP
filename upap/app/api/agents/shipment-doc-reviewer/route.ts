// مسار الوكيل: المنطق المشترك في lib/agentRoute.ts (حد الحجم، التحقق من المدخلات، رسائل خطأ عامة)
import { makeAgentRoute } from "../../../../lib/agentRoute";
import { SHIPMENT_DOC_REVIEWER_CONFIG } from "../../../../professions/logistics/agents/shipment-doc-reviewer/agent.config";

export const POST = makeAgentRoute(SHIPMENT_DOC_REVIEWER_CONFIG, "shipment-doc-reviewer");
