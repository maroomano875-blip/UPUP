// مسار الوكيل: المنطق المشترك في lib/agentRoute.ts (حد الحجم، التحقق من المدخلات، رسائل خطأ عامة)
import { makeAgentRoute } from "../../../../lib/agentRoute";
import { INVOICE_READER_CONFIG } from "../../../../professions/accounting/agents/invoice-reader/agent.config";

export const POST = makeAgentRoute(INVOICE_READER_CONFIG, "invoice-reader");
