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
  P('accounting', 'المحاسبة', 'Accounting', '🧮', '#10b981', 'dashboard', 'فواتير، ضرائب، تقارير مالية، إقفال شهري.',
    ['مطابقة كشوف البنك', 'إقرار ضريبي'],
    [{ slug: 'invoice-reader', name_ar: 'قارئ الفواتير', desc_ar: 'يستخرج بيانات الفاتورة (مورّد، تاريخ، بنود، ضريبة، إجمالي) ويراجعها بوكيل ثانٍ.', href: '/professions/accounting?agent=invoice-reader', needsApproval: false }]),
  P('law', 'القانون', 'Law', '⚖️', '#be4b5f', 'document_viewer', 'عقود، مذكرات، بحث قانوني، تحليل مخاطر.',
    ['صياغة المذكرات', 'بحث قانوني'],
    [{ slug: 'contract-reviewer', name_ar: 'مراجع العقود', desc_ar: 'يحلل العقد ويستخرج البنود الخطرة ويقترح تعديلات؛ يتطلب موافقة بشرية قبل التسليم.', href: '/professions/law?agent=contract-reviewer', needsApproval: true }]),
  P('medicine', 'الطب', 'Medicine', '🩺', '#14b8a6', 'timeline', 'ملخصات سريرية، ترميز تشخيصي، متابعة المريض.', [], [{ slug: 'lab-summarizer', name_ar: 'ملخّص التقارير الطبية', desc_ar: 'يلخّص التحاليل والتقارير الطبية بلغة مبسّطة، ويبرز القيم الخارجة عن المجال، ويقترح أسئلة للطبيب — دون تشخيص ودون علاج.', href: '/professions/medicine?agent=lab-summarizer', needsApproval: true }]),
  P('engineering', 'الهندسة', 'Engineering', '📐', '#f97316', 'dashboard', 'مواصفات، حساب كميات، مراجعة مخططات.', ['حساب كميات'], [{ slug: 'boq-reviewer', name_ar: 'مراجع جداول الكميات', desc_ar: 'يتحقق من حسابات جدول الكميات والمجاميع والبنود المكررة والناقصة — دون اعتماد هندسي.', href: '/professions/engineering?agent=boq-reviewer', needsApproval: true }]),
  P('education', 'التعليم', 'Education', '🎓', '#eab308', 'kanban', 'مناهج، اختبارات، تصحيح، خطط دروس.', ['مولّد اختبارات'], [{ slug: 'exam-reviewer', name_ar: 'مراجع الاختبارات', desc_ar: 'يقرأ ورقة الاختبار أو الأسئلة ويتحقق من مجموع الدرجات والأسئلة المكررة أو الغامضة ونموذج الإجابة وتوازن المستويات — مساعدة للمعلم دون تقييم الطلاب.', href: '/professions/education?agent=exam-reviewer', needsApproval: true }]),
  P('marketing', 'التسويق', 'Marketing', '📣', '#ec4899', 'kanban', 'حملات، محتوى، تحليل أداء، جمهور محلي.', ['خطة محتوى'], [{ slug: 'campaign-reviewer', name_ar: 'مراجع الحملات التسويقية', desc_ar: 'يقرأ خطة الحملة أو نصوص الإعلانات ويتحقق من الادعاءات المبالغ فيها والتواريخ وشروط العرض ومجموع الميزانية وغياب الدعوة لاتخاذ إجراء — دون وعود بالنتائج.', href: '/professions/marketing?agent=campaign-reviewer', needsApproval: true }]),
  P('hr', 'الموارد البشرية', 'Human Resources', '👥', '#8b5cf6', 'dashboard', 'توظيف، عقود عمل، رواتب، امتثال عمالي.', ['فرز السير الذاتية'], [{ slug: 'offer-reviewer', name_ar: 'مراجع عروض العمل', desc_ar: 'يراجع عروض العمل وعقود التوظيف: الرواتب، الفترات، ساعات العمل، والبنود غير المتوازنة', href: '/professions/hr?agent=offer-reviewer', needsApproval: true }]),
  P('real_estate', 'العقارات', 'Real Estate', '🏠', '#c2813f', 'dashboard', 'تقييم، عقود إيجار، تسويق وحدات.', ['مراجع عقود الإيجار'], [{ slug: 'property-contract-reviewer', name_ar: 'مراجع العقود العقارية', desc_ar: 'يراجع عقود البيع والإيجار: المساحات، الثمن والدفعات، المواعيد، الرهون، والبنود المجحفة', href: '/professions/real_estate?agent=property-contract-reviewer', needsApproval: true }]),
  P('insurance', 'التأمين', 'Insurance', '🛡️', '#4f6bed', 'document_viewer', 'مطالبات، وثائق، تقدير مخاطر.', ['فرز المطالبات'], [{ slug: 'policy-reviewer', name_ar: 'مراجع وثائق التأمين', desc_ar: 'يراجع وثائق التأمين: الأقساط، الدفعات، حدود التغطية، التناقض بين الشمول والاستثناءات', href: '/professions/insurance?agent=policy-reviewer', needsApproval: true }]),
  P('translation', 'الترجمة', 'Translation', '🌐', '#38bdf8', 'document_viewer', 'ترجمة معتمدة، توطين، مصطلحات.', ['مترجم وثائق'], [{ slug: 'translation-reviewer', name_ar: 'مراجع الترجمة', desc_ar: 'يقارن النص الأصلي بترجمته: الحذف والإضافة، عكس الأطراف، تغيّر الأرقام، وثبات المصطلحات', href: '/professions/translation?agent=translation-reviewer', needsApproval: true }]),
  P('programming', 'البرمجة', 'Programming', '💻', '#84cc16', 'chat', 'مراجعة كود، توثيق، اختبارات، ترحيل.', ['مراجع كود'], [{ slug: 'code-reviewer', name_ar: 'مراجع الشيفرة', desc_ar: 'يراجع الشيفرة: الثغرات الأمنية، الأخطاء المنطقية، وتعارض التوثيق مع السلوك الفعلي', href: '/professions/programming?agent=code-reviewer', needsApproval: true }]),
  P('design', 'التصميم', 'Design', '🎨', '#d946ef', 'kanban', 'هوية بصرية، مواصفات تصميم، نسخ إعلانية.', ['موجز تصميم'], [{ slug: 'design-quote-reviewer', name_ar: 'مراجع عروض التصميم', desc_ar: 'يراجع عروض أسعار واتفاقيات التصميم: الأسعار، نسب الدفع، المراجعات، والملكية', href: '/professions/design?agent=design-quote-reviewer', needsApproval: true }]),
  P('ecommerce', 'التجارة الإلكترونية', 'E-commerce', '🛒', '#fb7185', 'dashboard', 'أوصاف منتجات، تسعير، خدمة عملاء.', ['كاتب أوصاف المنتجات'], [{ slug: 'shop-order-reviewer', name_ar: 'مراجع المتجر الإلكتروني', desc_ar: 'يراجع الطلبات وصفحات المنتجات: المجاميع، الشحن، الإرجاع، الضمان، والادعاءات الصحية', href: '/professions/ecommerce?agent=shop-order-reviewer', needsApproval: true }]),
  P('logistics', 'اللوجستيات', 'Logistics', '🚚', '#f59e0b', 'timeline', 'شحن، تخليص جمركي، تتبع.', ['مستندات الشحن'], [{ slug: 'shipment-doc-reviewer', name_ar: 'مراجع مستندات الشحن', desc_ar: 'يراجع بوالص الشحن وقوائم التعبئة: الكميات والأوزان والتكاليف وشروط التسليم والتأمين', href: '/professions/logistics?agent=shipment-doc-reviewer', needsApproval: true }]),
  P('agriculture', 'الزراعة', 'Agriculture', '🌾', '#22c55e', 'dashboard', 'إرشاد زراعي، جدولة ري، تشخيص آفات.', ['مرشد زراعي'], [{ slug: 'farm-plan-reviewer', name_ar: 'مراجع الخطط الزراعية', desc_ar: 'يراجع الخطط الزراعية: المساحات والتكاليف والإنتاج المتوقع والري والمبيدات', href: '/professions/agriculture?agent=farm-plan-reviewer', needsApproval: true }]),
  P('tourism', 'السياحة', 'Tourism', '✈️', '#06b6d4', 'timeline', 'برامج رحلات، تأشيرات، حجوزات.', ['مخطط رحلات']),
  P('contracting', 'المقاولات', 'Contracting', '🏗️', '#a8a29e', 'dashboard', 'عطاءات، مستخلصات، جدولة أعمال.', ['مراجع عطاءات']),
  P('consulting', 'الاستشارات', 'Consulting', '📊', '#818cf8', 'dashboard', 'دراسات جدوى، خطط عمل، تحليل سوق.', ['دراسة جدوى']),
  P('journalism', 'الصحافة', 'Journalism', '📰', '#cbd5e1', 'document_viewer', 'تحرير، تدقيق حقائق، ملخصات أخبار.', ['مدقق حقائق']),
  P('industry', 'الصناعة', 'Industry', '🏭', '#b45309', 'dashboard', 'جودة، صيانة وقائية، تخطيط إنتاج.', ['جدولة صيانة']),
];

export const getProfession = (slug: string) => PROFESSIONS.find((p) => p.slug === slug) ?? null;
export const liveAgents = () => PROFESSIONS.flatMap((p) => p.agents.map((a) => ({ ...a, profession: p })));
