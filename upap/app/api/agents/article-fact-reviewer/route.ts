// مسار الوكيل: المنطق المشترك في lib/agentRoute.ts (حد الحجم، التحقق من المدخلات، رسائل خطأ عامة)
import { makeAgentRoute } from "../../../../lib/agentRoute";
import { ARTICLE_FACT_REVIEWER_CONFIG } from "../../../../professions/journalism/agents/article-fact-reviewer/agent.config";

export const POST = makeAgentRoute(ARTICLE_FACT_REVIEWER_CONFIG, "article-fact-reviewer");
