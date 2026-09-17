// ==========================================================
// مولّد الواجهات — يقرأ profession.config.ts وينتج إعدادات
// الواجهة المناسبة تلقائياً (بدون بناء ملف React جديد يدوياً)
// ==========================================================
import { ProfessionConfig, LayoutStyle } from "../../professions/_template/profession.config";

export interface GeneratedUIConfig {
  profession_slug: string;
  layout: LayoutStyle;
  theme: {
    accent: string;              // لون المهنة (من profession.config.color)
    icon: string;
  };
  direction: "rtl" | "ltr";
  widgets: string[];             // أسماء المكونات الواجب عرضها بالترتيب
  navigation: { label_ar: string; label_en: string; href: string }[];
}

// خريطة: كل نمط تخطيط → مكوناته الافتراضية
const LAYOUT_WIDGETS: Record<LayoutStyle, string[]> = {
  dashboard: ["StatsRow", "ResultCard", "AuditTrail"],
  document_viewer: ["FileUpload", "ResultCard", "ApprovalGate"],
  timeline: ["AuditTrail", "ResultCard"],
  list: ["ResultCard"],
};

export function generateUI(config: ProfessionConfig, language: string): GeneratedUIConfig {
  const isArabic = language.startsWith("ar");

  return {
    profession_slug: config.slug,
    layout: config.layout,
    theme: {
      accent: config.color,
      icon: config.icon,
    },
    direction: isArabic ? "rtl" : "ltr",
    widgets: [...LAYOUT_WIDGETS[config.layout], ...config.dashboard_widgets],
    navigation: [
      { label_ar: "لوحة التحكم", label_en: "Dashboard", href: `/dashboard/${config.slug}` },
      { label_ar: "الطلبات", label_en: "Requests", href: `/dashboard/${config.slug}/requests` },
      { label_ar: "الاشتراك", label_en: "Billing", href: `/dashboard/${config.slug}/billing` },
    ],
  };
}
