"use client";
// ==========================================================
// صفحة وكيل مراجعة العقود — الآن مع اختيار الدولة الفعلي
// (الدولة تحدد القانون المرجعي المفترض واللغة)
// ==========================================================
import { useState } from "react";
import { FileUpload } from "../../../../ui/components/FileUpload";
import { CountrySelector, SUPPORTED_COUNTRIES, CountryOption } from "../../../../ui/components/CountrySelector";

interface Clause {
  clause_id: string;
  type: string;
  risk_level: "low" | "medium" | "high" | "critical";
  risk_explanation: string;
  recommendation: string;
}

interface ContractResult {
  request_id: string;
  confidence_score: number;
  warnings: string[];
  needs_human_review: boolean;
  output: {
    contract_type?: string;
    governing_law?: string;
    jurisdiction?: string;
    overall_risk?: string;
    executive_summary_ar?: string;
    clauses?: Clause[];
  };
}

const RISK_STYLES: Record<string, string> = {
  low: "text-forest border-forest/30 bg-forest/5",
  medium: "text-brass border-brass/30 bg-brass/5",
  high: "text-oxblood border-oxblood/30 bg-oxblood/5",
  critical: "text-white bg-oxblood border-oxblood",
};

const RISK_LABELS_AR: Record<string, string> = {
  low: "منخفض", medium: "متوسط", high: "مرتفع", critical: "حرج",
};

export default function ContractReviewerPage() {
  const [country, setCountry] = useState<CountryOption>(SUPPORTED_COUNTRIES[0]);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<ContractResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleFile(file: File) {
    setStatus("loading");
    setErrorMsg("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("country", country.code);
      formData.append("language", country.language);

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

  return (
    <main dir="rtl" className="min-h-screen bg-paper px-4 py-10 max-w-2xl mx-auto">
      <div className="mb-6">
        <p className="font-mono text-xs text-brass tracking-wider mb-2">
          LAW / CONTRACT REVIEWER
        </p>
        <h1 className="font-arabic text-2xl font-bold text-ink">مراجع العقود</h1>
        <p className="font-arabic text-sm text-ink-soft mt-1">
          ارفع عقد PDF، ورح يحلل كل بند ويوضح مستوى الخطورة والتوصية.
        </p>
      </div>

      <div className="mb-6">
        <p className="font-arabic text-xs text-ink-soft mb-2">القانون المرجعي المفترض (تحدد اللغة والسياق):</p>
        <CountrySelector value={country.code} onChange={setCountry} />
      </div>

      <FileUpload onFileSelected={handleFile} accept=".pdf" />

      {status === "loading" && (
        <div className="mt-6 border border-hairline bg-paper-raised px-5 py-4">
          <p className="font-mono text-xs text-brass animate-pulse">
            جارِ تحليل العقد بند بند ({country.name_ar})...
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
          {result.needs_human_review && (
            <div className="border-r-4 border-brass bg-paper-raised border border-hairline px-5 py-3">
              <p className="font-mono text-xs text-brass mb-1">NEEDS HUMAN REVIEW</p>
              <p className="font-arabic text-sm text-ink">
                هاد التحليل يحتاج مراجعة محامي قبل أي قرار — العقود دائماً أعلى خطورة من الفواتير.
              </p>
            </div>
          )}

          <div className="border border-hairline bg-paper-raised">
            <div className="px-5 py-3 border-b border-hairline flex justify-between items-center">
              <h3 className="font-arabic font-bold text-ink">
                {result.output.contract_type || "عقد غير مصنّف"}
              </h3>
              <span className="font-mono text-xs text-brass">
                {Math.round(result.confidence_score * 100)}% ثقة
              </span>
            </div>
            <div className="px-5 py-3 border-b border-hairline text-sm font-arabic text-ink-soft">
              القانون الحاكم: {result.output.governing_law || "—"} · الاختصاص: {result.output.jurisdiction || "—"}
            </div>
            {result.output.executive_summary_ar && (
              <p className="px-5 py-3 font-arabic text-sm text-ink leading-relaxed">
                {result.output.executive_summary_ar}
              </p>
            )}
          </div>

          {(result.output.clauses ?? []).map((clause) => (
            <div key={clause.clause_id} className={`border px-4 py-3 ${RISK_STYLES[clause.risk_level] ?? ""}`}>
              <div className="flex justify-between items-center mb-1">
                <span className="font-arabic text-sm font-semibold">{clause.type}</span>
                <span className="font-mono text-xs">{RISK_LABELS_AR[clause.risk_level] ?? clause.risk_level}</span>
              </div>
              <p className="font-arabic text-xs mb-1">{clause.risk_explanation}</p>
              <p className="font-arabic text-xs opacity-80">التوصية: {clause.recommendation}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
