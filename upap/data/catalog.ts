// سجل المهن الـ20. الحالة live = لها وكلاء حقيقيون يعملون الآن.
export type Status = 'live' | 'planned';
export interface LiveAgent { slug: string; name_ar: string; desc_ar: string; href: string; needsApproval: boolean }
export interface Profession {
  slug: string; name_ar: string; name_en: string; icon: string; color: string;
  layout: 'dashboard' | 'document_viewer' | 'timeline' | 'kanban' | 'chat';
  desc_ar: string; status: Status; agents: LiveAgent[]; planned_agents: string[];
}

const P = (slug: string, name_ar: string, name_en: string, icon: string, color: string,
  layout: Profession['layout'], desc_ar: string, planned_agents: string[] = [], agents: LiveAgent[] = []): Profession =>
  ({ slug, name_ar, name_en, icon, color, layout, desc_ar, status: agents.length ? 'live' : 'planned', agents, planned_agents });

export const PROFESSIONS: Profession[] = [
  P('accounting', 'المحاسبة', 'Accounting', '🧮', '#0ea5e9', 'dashboard', 'فواتير، ضرائب، تقارير مالية، إقفال شهري.',
    ['مطابقة كشوف البنك', 'إقرار ضريبي'],
    [{ slug: 'invoice-reader', name_ar: 'قارئ الفواتير', desc_ar: 'يستخرج بيانات الفاتورة (مورّد، تاريخ، بنود، ضريبة، إجمالي) ويراجعها بوكيل ثانٍ.', href: '/professions/accounting/invoice-reader', needsApproval: false }]),
  P('law', 'القانون', 'Law', '⚖️', '#8b5cf6', 'document_viewer', 'عقود، مذكرات، بحث قانوني، تحليل مخاطر.',
    ['صياغة المذكرات', 'بحث قانوني'],
    [{ slug: 'contract-reviewer', name_ar: 'مراجع العقود', desc_ar: 'يحلل العقد ويستخرج البنود الخطرة ويقترح تعديلات؛ يتطلب موافقة بشرية قبل التسليم.', href: '/professions/law/contract-reviewer', needsApproval: true }]),
  P('medicine', 'الطب', 'Medicine', '🩺', '#ef4444', 'timeline', 'ملخصات سريرية، ترميز تشخيصي، متابعة المريض.', ['ملخص سريري']),
  P('engineering', 'الهندسة', 'Engineering', '📐', '#f59e0b', 'dashboard', 'مواصفات، حساب كميات، مراجعة مخططات.', ['حساب كميات']),
  P('education', 'التعليم', 'Education', '🎓', '#22c55e', 'kanban', 'مناهج، اختبارات، تصحيح، خطط دروس.', ['مولّد اختبارات']),
  P('marketing', 'التسويق', 'Marketing', '📣', '#ec4899', 'kanban', 'حملات، محتوى، تحليل أداء، جمهور محلي.', ['خطة محتوى']),
  P('hr', 'الموارد البشرية', 'Human Resources', '👥', '#14b8a6', 'dashboard', 'توظيف، عقود عمل، رواتب، امتثال عمالي.', ['فرز السير الذاتية']),
  P('real_estate', 'العقارات', 'Real Estate', '🏠', '#a3653a', 'dashboard', 'تقييم، عقود إيجار، تسويق وحدات.', ['مراجع عقود الإيجار']),
  P('insurance', 'التأمين', 'Insurance', '🛡️', '#3b82f6', 'document_viewer', 'مطالبات، وثائق، تقدير مخاطر.', ['فرز المطالبات']),
  P('translation', 'الترجمة', 'Translation', '🌐', '#06b6d4', 'document_viewer', 'ترجمة معتمدة، توطين، مصطلحات.', ['مترجم وثائق']),
  P('programming', 'البرمجة', 'Programming', '💻', '#64748b', 'chat', 'مراجعة كود، توثيق، اختبارات، ترحيل.', ['مراجع كود']),
  P('design', 'التصميم', 'Design', '🎨', '#d946ef', 'kanban', 'هوية بصرية، مواصفات تصميم، نسخ إعلانية.', ['موجز تصميم']),
  P('ecommerce', 'التجارة الإلكترونية', 'E-commerce', '🛒', '#f97316', 'dashboard', 'أوصاف منتجات، تسعير، خدمة عملاء.', ['كاتب أوصاف المنتجات']),
  P('logistics', 'اللوجستيات', 'Logistics', '🚚', '#0891b2', 'timeline', 'شحن، تخليص جمركي، تتبع.', ['مستندات الشحن']),
  P('agriculture', 'الزراعة', 'Agriculture', '🌾', '#65a30d', 'dashboard', 'إرشاد زراعي، جدولة ري، تشخيص آفات.', ['مرشد زراعي']),
  P('tourism', 'السياحة', 'Tourism', '✈️', '#0d9488', 'timeline', 'برامج رحلات، تأشيرات، حجوزات.', ['مخطط رحلات']),
  P('contracting', 'المقاولات', 'Contracting', '🏗️', '#78716c', 'dashboard', 'عطاءات، مستخلصات، جدولة أعمال.', ['مراجع عطاءات']),
  P('consulting', 'الاستشارات', 'Consulting', '📊', '#4f46e5', 'dashboard', 'دراسات جدوى، خطط عمل، تحليل سوق.', ['دراسة جدوى']),
  P('journalism', 'الصحافة', 'Journalism', '📰', '#475569', 'document_viewer', 'تحرير، تدقيق حقائق، ملخصات أخبار.', ['مدقق حقائق']),
  P('industry', 'الصناعة', 'Industry', '🏭', '#b45309', 'dashboard', 'جودة، صيانة وقائية، تخطيط إنتاج.', ['جدولة صيانة']),
];

export const getProfession = (slug: string) => PROFESSIONS.find((p) => p.slug === slug) ?? null;
export const liveAgents = () => PROFESSIONS.flatMap((p) => p.agents.map((a) => ({ ...a, profession: p })));
