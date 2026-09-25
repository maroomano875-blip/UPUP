"use client";
// ==========================================================
// صفحة وكيل قراءة الفواتير — أول واجهة فعلية على المنصة
// ==========================================================
import { useState } from "react";
import { FileUpload } from "../../../../ui/components/FileUpload";
import { ResultCard } from "../../../../ui/components/ResultCard";

interface InvoiceResult {
  request_id: string;
  status: string;
  confidence_score: number;
  warnings: string[];
  output: {
    vendor_name?: string;
    invoice_number?: string;
    invoice_date?: string;
    total?: number;
    currency?: string;
    tax?: number;
    category?: string;
    suggested_journal_entry?: {
      debit_account?: string;
      credit_account?: string;
      amount?: number;
    };
  };
}

export default function InvoiceReaderPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<InvoiceResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleFile(file: File) {
    setStatus("loading");
    setErrorMsg("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("country", "US");
      formData.append("language", "ar");

      const res = await fetch("/api/agents/invoice-reader", {
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
      <div className="mb-8">
        <p className="font-mono text-xs text-brass tracking-wider mb-2">
          ACCOUNTING / INVOICE READER
        </p>
        <h1 className="font-arabic text-2xl font-bold text-ink">قارئ الفواتير</h1>
        <p className="font-arabic text-sm text-ink-soft mt-1">
          ارفع صورة أو PDF لفاتورة، ورح تستخرج بياناتها تلقائياً خلال ثوانٍ.
        </p>
      </div>

      <FileUpload onFileSelected={handleFile} />

      {status === "loading" && (
        <div className="mt-6 border border-hairline bg-paper-raised px-5 py-4">
          <p className="font-mono text-xs text-brass animate-pulse">
            جارِ قراءة الفاتورة ومراجعتها...
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="mt-6 border border-oxblood/30 bg-oxblood/5 px-5 py-4">
          <p className="font-arabic text-sm text-oxblood">⚠ {errorMsg}</p>
        </div>
      )}

      {status === "done" && result && (
        <div className="mt-6">
          <ResultCard
            title_ar={`فاتورة ${result.output.vendor_name || "غير معروف"}`}
            confidence={result.confidence_score}
            warnings={result.warnings}
            fields={[
              { label_ar: "المورد", value: result.output.vendor_name || "—" },
              { label_ar: "رقم الفاتورة", value: result.output.invoice_number || "—", mono: true },
              { label_ar: "التاريخ", value: result.output.invoice_date || "—", mono: true },
              {
                label_ar: "الإجمالي",
                value: `${result.output.total ?? 0} ${result.output.currency ?? ""}`,
                mono: true,
              },
              { label_ar: "التصنيف", value: result.output.category || "—" },
              {
                label_ar: "القيد المقترح",
                value: `مدين: ${result.output.suggested_journal_entry?.debit_account || "—"}`,
              },
            ]}
          />
        </div>
      )}
    </main>
  );
}
