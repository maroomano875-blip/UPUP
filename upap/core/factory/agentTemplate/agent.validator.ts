// ==========================================================
// قالب التحقق — كل وكيل يربط مخططه من core/factory/validators/schema.ts
// ==========================================================
import { z } from "zod";
import { CountryConfig } from "../../types/country";

interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}

// تحقق عام: يحوّل نص AI الخام إلى JSON، ثم يتحقق حسب مخطط Zod المُمرَّر
export function validateAgentOutput<T>(
  rawText: string,
  schema: z.ZodType<T>
): ValidationResult<T> {
  let parsed: unknown;
  try {
    const cleaned = rawText.replace(/```json|```/g, "").trim();
    parsed = JSON.parse(cleaned);
  } catch {
    return { success: false, errors: ["فشل تحويل الرد إلى JSON صالح"] };
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    return {
      success: false,
      errors: result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`),
    };
  }
  return { success: true, data: result.data };
}

// تحقق إضافي حسب قواعد الدولة (مثال: صيغة الرقم الضريبي)
export function validateAgainstCountryRules(
  output: Record<string, unknown>,
  country: CountryConfig
): string[] {
  const warnings: string[] = [];
  for (const field of country.invoice_fields.required_fields) {
    if (!output[field]) {
      warnings.push(`حقل إلزامي حسب قوانين ${country.name_ar} مفقود: ${field}`);
    }
  }
  return warnings;
}
