// ==========================================================
// قالب إعدادات مهنة جديدة
// انسخ مجلد professions/_template إلى professions/<اسم-المهنة>
// وعدّل هذا الملف — يقرأه ui/generator/generateUI.ts تلقائياً
// ==========================================================

export type LayoutStyle = "dashboard" | "document_viewer" | "timeline" | "list";

export interface ProfessionConfig {
  slug: string;                 // معرف فريد: accounting, law, medicine...
  name_ar: string;
  name_en: string;
  icon: string;                 // إيموجي أو اسم أيقونة
  color: string;                // لون UI الأساسي للمهنة (hex)
  description_ar: string;
  description_en: string;

  // كيف تُعرض واجهة هذه المهنة؟ يقرأه UI Generator
  layout: LayoutStyle;

  // الوكلاء المرتبطون بهذه المهنة (تُملأ تدريجياً)
  agent_ids: string[];

  // الحقول التي تظهر بلوحة تحكم هذه المهنة تحديداً
  dashboard_widgets: string[];  // مثال: ["recent_invoices", "monthly_total", "pending_review"]
}

export const TEMPLATE_PROFESSION: ProfessionConfig = {
  slug: "template",
  name_ar: "اسم المهنة",
  name_en: "Profession Name",
  icon: "📁",
  color: "#14213D",
  description_ar: "وصف مختصر للمهنة",
  description_en: "Short profession description",
  layout: "dashboard",
  agent_ids: [],
  dashboard_widgets: [],
};
