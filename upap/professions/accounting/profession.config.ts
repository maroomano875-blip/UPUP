// ==========================================================
// مهنة المحاسبة — أول مهنة فعلية على المنصة
// ==========================================================
import { ProfessionConfig } from "../_template/profession.config";

export const ACCOUNTING_PROFESSION: ProfessionConfig = {
  slug: "accounting",
  name_ar: "محاسبة",
  name_en: "Accounting",
  icon: "📊",
  color: "#2F5D45",
  description_ar: "وكلاء ذكاء اصطناعي لقراءة الفواتير وتصنيفها وإعداد القيود المحاسبية",
  description_en: "AI agents for invoice reading, classification, and journal entries",
  layout: "dashboard",
  agent_ids: ["accounting.invoice-reader"],
  dashboard_widgets: ["recent_invoices", "monthly_total"],
};
