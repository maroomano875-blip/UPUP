// ==========================================================
// قالب البرومبت — كل وكيل جديد يملأ هذا بمعرفته المتخصصة
// ==========================================================

// القاعدة الثابتة لكل الوكلاء بالمنصة — لا تُحذف من أي وكيل جديد
export const UNIVERSAL_AGENT_RULES = `
قواعد ثابتة لكل وكلاء منصة UPAP:
1. أعد فقط كائن JSON صالح مطابق للمخطط المطلوب، بدون أي شرح أو Markdown.
2. إن كان حقل غير واضح، اتركه فارغاً وأضف تحذيراً واضحاً في warnings.
3. احسب confidence_score بصدق: لا تُظهر ثقة عالية في بيانات غامضة.
4. طبّق قوانين وتنسيقات الدولة المحددة ({country}) بدقة (تواريخ، عملة، أرقام ضريبية).
5. افهم اللغة المحددة ({language}) بكل لهجاتها إن كانت عربية.
`.trim();

export function buildTemplatePrompt(
  specializedInstructions: string,
  outputSchemaExample: string,
  country: string,
  language: string,
  context: Record<string, unknown> = {}
): string {
  return `
${UNIVERSAL_AGENT_RULES}

تعليمات متخصصة لهذا الوكيل:
${specializedInstructions}

الدولة: ${country} | اللغة: ${language}
سياق إضافي: ${JSON.stringify(context)}

مخطط JSON المطلوب بالضبط:
${outputSchemaExample}
`.trim();
}
