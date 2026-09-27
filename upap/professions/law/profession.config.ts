// ==========================================================
// مهنة المحاماة — ثاني مهنة فعلية على المنصة
// ==========================================================
import { ProfessionConfig } from "../_template/profession.config";

export const LAW_PROFESSION: ProfessionConfig = {
  slug: "law",
  name_ar: "محاماة وقانون",
  name_en: "Law",
  icon: "⚖️",
  color: "#14213D",
  description_ar: "وكلاء ذكاء اصطناعي لمراجعة العقود وتحليل بنودها وتقييم مخاطرها",
  description_en: "AI agents for contract review, clause analysis, and risk assessment",
  layout: "document_viewer",
  agent_ids: ["law.contract-reviewer"],
  dashboard_widgets: ["recent_contracts", "high_risk_alerts"],
};
