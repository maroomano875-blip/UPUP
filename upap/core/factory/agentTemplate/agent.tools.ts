// ==========================================================
// قالب الأدوات — كل وكيل يختار الأدوات التي يحتاجها من هنا
// أضف أدوات جديدة هنا وشاركها بين كل الوكلاء
// ==========================================================

// استخراج نص من PDF (مجاني بالكامل، بدون أي API خارجي)
export async function ocrPDF(buffer: Buffer): Promise<string> {
  const pdfParse = (await import("pdf-parse")).default;
  const result = await pdfParse(buffer);
  return result.text.trim();
}

// تصنيف نص ضمن فئات محددة مسبقاً (تُستخدم غالباً عبر استدعاء AI منفصل خفيف)
export function classify(_text: string, categories: string[]): string {
  // Placeholder بسيط — الوكلاء الفعليون يستبدلون هذا باستدعاء AI حقيقي
  return categories[0] ?? "uncategorized";
}

// تحقق من صحة رقم ضريبي حسب نمط الدولة (regex من compliance/countries)
export function validateTaxId(taxId: string, pattern?: string): boolean {
  if (!pattern) return taxId.length > 0;
  return new RegExp(pattern).test(taxId);
}

// حساب بسيط (يُستخدم للتحقق من صحة المجاميع الحسابية في الفواتير/العقود)
export function calculateTotal(lineItems: { total: number }[]): number {
  return lineItems.reduce((sum, item) => sum + item.total, 0);
}

// البحث في قاعدة معرفة الوكيل (RAG) — يُستكمل عند ربط embeddings حقيقية
export async function searchKnowledge(_query: string, _knowledgeBaseIds: string[]): Promise<string[]> {
  // Placeholder — سيُربط لاحقاً بـ Supabase pgvector (مجاني ضمن الخطة المجانية)
  return [];
}
