// مسار الوكيل: المنطق المشترك في lib/agentRoute.ts (حد الحجم، التحقق من المدخلات، رسائل خطأ عامة)
import { makeAgentRoute } from "../../../../lib/agentRoute";
import { SHOP_ORDER_REVIEWER_CONFIG } from "../../../../professions/ecommerce/agents/shop-order-reviewer/agent.config";

export const POST = makeAgentRoute(SHOP_ORDER_REVIEWER_CONFIG, "shop-order-reviewer");
