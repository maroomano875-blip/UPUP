// ==========================================================
// قالب الاختبارات — كل وكيل يجب أن يُختبر على 3 دول على الأقل
// شغّله بـ: npx tsx core/factory/agentTemplate/agent.test.ts
// (هذا قالب — الوكلاء الفعليون ينسخونه ويملؤونه ببيانات حقيقية)
// ==========================================================

interface TestCase {
  label: string;
  country: string;
  language: string;
  input: string;
  expectedFields: string[]; // الحقول التي يجب أن تظهر بنتيجة صحيحة
}

// 3 حالات إلزامية حسب القاعدة رقم 7 بالمواصفات: US, SA, SY
export const REQUIRED_TEST_CASES: TestCase[] = [
  {
    label: "US — English invoice",
    country: "US",
    language: "en-US",
    input: "Invoice #1001 from Acme Corp, dated 01/15/2025, Total: $500.00",
    expectedFields: ["vendor_name", "invoice_number", "total", "currency"],
  },
  {
    label: "SA — Arabic invoice with VAT",
    country: "SA",
    language: "ar-SA",
    input: "فاتورة رقم 2045 من شركة النور، بتاريخ 15/01/2025، الإجمالي شامل الضريبة: 500 ريال",
    expectedFields: ["vendor_name", "invoice_number", "total", "tax"],
  },
  {
    label: "SY — Arabic invoice, local dialect",
    country: "SY",
    language: "ar-SY",
    input: "فاتورة رقم 87 من محل الأمانة، تاريخ 15 كانون الثاني 2025، المجموع 500 ألف ليرة",
    expectedFields: ["vendor_name", "invoice_number", "total"],
  },
];

export async function runTemplateTests(
  runFn: (input: string, country: string, language: string) => Promise<Record<string, unknown>>
): Promise<void> {
  for (const testCase of REQUIRED_TEST_CASES) {
    console.log(`\n🧪 اختبار: ${testCase.label}`);
    try {
      const result = await runFn(testCase.input, testCase.country, testCase.language);
      const missing = testCase.expectedFields.filter((f) => !(f in result));
      if (missing.length === 0) {
        console.log("✅ نجح — كل الحقول المتوقعة موجودة");
      } else {
        console.log(`⚠️ حقول مفقودة: ${missing.join(", ")}`);
      }
    } catch (err) {
      console.error(`❌ فشل الاختبار: ${(err as Error).message}`);
    }
  }
}
