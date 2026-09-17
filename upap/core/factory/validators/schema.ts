// ==========================================================
// مخططات Zod الأساسية — تُستخدم في كل وكلاء المنصة
// كل وكيل يُضيف مخططه الخاص ويرث من هذه الأساسيات
// ==========================================================
import { z } from "zod";

// ── الحقول المشتركة بين جميع مخرجات الوكلاء ─────────────
export const BaseOutputSchema = z.object({
  confidence_score: z.number().min(0).max(1),
  warnings: z.array(z.string()),
  processing_notes: z.string().optional(),
});

// ── مخطط الفاتورة (وكيل المحاسبة) ───────────────────────
export const LineItemSchema = z.object({
  description: z.string(),
  quantity: z.number(),
  unit_price: z.number(),
  total: z.number(),
});

export const InvoiceOutputSchema = BaseOutputSchema.extend({
  vendor_name: z.string(),
  vendor_country: z.string(),
  invoice_number: z.string(),
  invoice_date: z.string(),
  due_date: z.string(),
  currency: z.string(),
  subtotal: z.number(),
  tax: z.number(),
  total: z.number(),
  line_items: z.array(LineItemSchema),
  category: z.string(),
  payment_method: z.string(),
  suggested_journal_entry: z.object({
    debit_account: z.string(),
    credit_account: z.string(),
    amount: z.number(),
  }),
});

// ── مخطط بند العقد (وكيل المحاماة) ──────────────────────
export const ContractClauseSchema = z.object({
  clause_id: z.string(),
  type: z.string(),                          // termination, liability, payment...
  text_original: z.string(),
  risk_level: z.enum(["low", "medium", "high", "critical"]),
  risk_explanation: z.string(),
  recommendation: z.string(),
});

export const ContractReviewOutputSchema = BaseOutputSchema.extend({
  contract_type: z.string(),
  parties: z.array(z.object({ role: z.string(), name: z.string() })),
  governing_law: z.string(),
  jurisdiction: z.string(),
  effective_date: z.string(),
  expiry_date: z.string(),
  clauses: z.array(ContractClauseSchema),
  overall_risk: z.enum(["low", "medium", "high", "critical"]),
  executive_summary: z.string(),
  executive_summary_ar: z.string(),
});

// ── المخططات المصدّرة للاستخدام الخارجي ─────────────────
export type InvoiceOutput = z.infer<typeof InvoiceOutputSchema>;
export type ContractReviewOutput = z.infer<typeof ContractReviewOutputSchema>;
