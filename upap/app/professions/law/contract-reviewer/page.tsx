"use client";
// ==========================================================
// صفحة وكيل مراجعة العقود
// ==========================================================
import { useState } from "react";
import { FileUpload } from "../../../../ui/components/FileUpload";

interface Clause {
  clause_id: string;
  type: string;
  text_original: string;
  risk_level: "low" | "medium" | "high" | "critical";
  risk_explanation: string;
  recommendation: string;
}

interface ContractResult {
  request_id: string;
  status: string;
  confidence_score: number;
  warnings: string[];
  needs_human_review: boolean;
  output: {
    contract_type?: string;
    parties?: { role: string; name: string }[];
    governing_law?: string;
    jurisdiction?: string;
    overall_risk?: "low" | "medium" | "high" | "critical";
    executive_summary_ar?: string;
    clauses?: Clause[];
  };
}

const RISK_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  low: { bg: "bg-forest/10", text: "text-forest", label: "منخفض" },
  medium: { bg: "bg-brass/10", text: "text-brass", label: "متوسط" },
  high: { bg: "bg-oxblood/10", text: "text-oxblood", label: "مرتفع" },
  critical: { bg: "bg-oxblood/20", text: "text-oxblood", label: "حرج" },
};

export default function ContractReviewerPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<ContractResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleFile(file: File) {
    setStatus("loading");
    setErrorMsg("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("country", "US");
      formData.append("language", "ar");

      const res = await fetch("/api/agents/contract-reviewer", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشلت المعالجة");

      setResult(data);
      setStatus("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "خطأ غير متوقع");
      setStatus("error");
    }
  }

  const overallRisk = result?.output.overall_risk ?? "low";
  const overallStyle = RISK_STYLES[overallRisk];

  return (
    <main dir="rtl" className="min-h-screen bg-paper px-4 py-10 max-w-2xl mx-auto">
      <div className="mb-8">
        <p className="font-mono text-xs text-brass tracking-wider mb-2">
          LAW / CONTRACT REVIEWER
        </p>
        <h1 className="font-arabic text-2xl font-bold text-ink">مراجع العقود</h1>
        <p className="font-arabic text-sm text-ink-soft mt-1">
          ارفع عقد PDF، ورح يحلل بنوده ويقيّم مخاطر كل بند تلقائياً.
        </p>
      </div>

      <FileUpload onFileSelected={handleFile} accept=".pdf,.jpg,.jpeg,.png" />

      {status === "loading" && (
        <div className="mt-6 border border-hairline bg-paper-raised px-5 py-4">
          <p className="font-mono text-xs text-brass animate-pulse">
            جارِ تحليل العقد ومراجعة بنوده...
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="mt-6 border border-oxblood/30 bg-oxblood/5 px-5 py-4">
          <p className="font-arabic text-sm text-oxblood">⚠ {errorMsg}</p>
        </div>
      )}

      {status === "done" && result && (
        <div className="mt-6 space-y-4">
          {/* بطاقة الملخص التنفيذي */}
          <div className="border border-hairline bg-paper-raised">
            <div className="flex items-center justify-between px-5 py-3 border-b border-hairline">
              <h3 className="font-arabic font-bold text-ink">
                {result.output.contract_type || "عقد"}
              </h3>
              <span className={`font-mono text-xs px-2 py-1 ${overallStyle.bg} ${overallStyle.text}`}>
                خطورة إجمالية: {overallStyle.label}
              </span>
            </div>
            <div className="px-5 py-4">
              <p className="font-arabic text-sm text-ink leading-relaxed">
                {result.output.executive_summary_ar}
              </p>
              {result.output.governing_law && (
                <p className="font-arabic text-xs text-ink-soft mt-3">
                  القانون الحاكم: {result.output.governing_law}
                  {result.output.jurisdiction && ` — الاختصاص: ${result.output.jurisdiction}`}
                </p>
              )}
            </div>
            {result.needs_human_review && (
              <div className="px-5 py-3 bg-brass/5 border-t border-brass/20">
                <p className="font-arabic text-xs text-brass">
                  ⚠ هذا التحليل يتطلب مراجعة محامٍ بشري قبل الاعتماد النهائي
                </p>
              </div>
            )}
          </div>

          {/* قائمة البنود */}
          {result.output.clauses && result.output.clauses.length > 0 && (
            <div className="border border-hairline bg-paper-raised">
              <div className="px-5 py-3 border-b border-hairline">
                <h4 className="font-mono text-xs text-brass tracking-wider">CLAUSES</h4>
              </div>
              {result.output.clauses.map((clause, i) => {
                const style = RISK_STYLES[clause.risk_level] ?? RISK_STYLES.low;
                return (
                  <div key={i} className="px-5 py-4 border-b border-hairline last:border-b-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-arabic text-sm font-semibold text-ink">
                        {clause.type}
                      </span>
                      <span className={`font-mono text-xs px-2 py-0.5 ${style.bg} ${style.text}`}>
                        {style.label}
                      </span>
                    </div>
                    {clause.risk_explanation && (
                      <p className="font-arabic text-xs text-ink-soft mb-1">
                        {clause.risk_explanation}
                      </p>
                    )}
                    {clause.recommendation && (
                      <p className="font-arabic text-xs text-forest">
                        ↳ {clause.recommendation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {result.warnings.length > 0 && (
            <div className="border border-oxblood/20 bg-oxblood/5 px-5 py-3">
              {result.warnings.map((w, i) => (
                <p key={i} className="font-arabic text-xs text-oxblood">⚠ {w}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
