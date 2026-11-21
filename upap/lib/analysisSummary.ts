// بناء «ملخص» تحليل للسجل: قيم قصيرة وأرقام فقط، لا نص المستند ولا تفاصيله (خصوصية + حجم صغير).
export type AnalysisSummary = {
  doc_type?: string;
  party?: string;
  total?: string;
  currency?: string;
  counts?: Partial<Record<'sections' | 'items' | 'tests' | 'clauses', number>>;
  confidence: number;
  warnings: number;
  needs_review: boolean;
  file_name?: string;
};

const short = (v: unknown, n: number): string | undefined => {
  if (typeof v !== 'string' && typeof v !== 'number') return undefined;
  const s = String(v).replace(/\s+/g, ' ').trim().slice(0, n);
  return s || undefined;
};

export function buildSummary(
  result: { output?: unknown; confidence_score?: unknown; warnings?: unknown; needs_human_review?: unknown },
  fileName?: string,
): AnalysisSummary {
  const o = (result.output && typeof result.output === 'object' ? result.output : {}) as Record<string, unknown>;
  const counts: AnalysisSummary['counts'] = {};
  if (Array.isArray(o.sections)) counts.sections = o.sections.length;
  if (Array.isArray(o.boq_items)) counts.items = o.boq_items.length;
  if (Array.isArray(o.tests)) counts.tests = o.tests.length;
  if (Array.isArray(o.clauses)) counts.clauses = o.clauses.length;
  const conf = Number(result.confidence_score);
  const s: AnalysisSummary = {
    doc_type: short(o.document_type ?? o.contract_type, 80),
    party: short(o.vendor_name, 80),
    total: short(o.total, 40),
    currency: short(o.currency, 8),
    counts: Object.keys(counts).length ? counts : undefined,
    confidence: Number.isFinite(conf) ? Math.max(0, Math.min(1, conf)) : 0,
    warnings: Array.isArray(result.warnings) ? result.warnings.length : 0,
    needs_review: result.needs_human_review === true,
    file_name: short(fileName, 120),
  };
  // نحذف المفاتيح الفارغة ليبقى الملخص صغيراً
  return Object.fromEntries(Object.entries(s).filter(([, v]) => v !== undefined)) as AnalysisSummary;
}
