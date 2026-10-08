"use client";
import { useState } from "react";
import { FileUpload } from "../../../../ui/components/FileUpload";
import { ResultCard } from "../../../../ui/components/ResultCard";
import { CountrySelector, SUPPORTED_COUNTRIES, CountryOption } from "../../../../ui/components/CountrySelector";
import { LanguageSelector, SUPPORTED_LANGUAGES } from "../../../../ui/components/LanguageSelector";
import { SectionCard } from "../../../../ui/components/SectionCard";

interface InvoiceResult {
  confidence_score: number;
  warnings: string[];
  output: {
    vendor_name?: string;
    invoice_number?: string;
    invoice_date?: string;
    total?: number;
    currency?: string;
    category?: string;
    suggested_journal_entry?: { debit_account?: string };
  };
}

export default function InvoiceReaderPage() {
  const [country, setCountry] = useState<CountryOption>(SUPPORTED_COUNTRIES[0]);
  const [language, setLanguage] = useState(SUPPORTED_LANGUAGES[0].code);
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<InvoiceResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit() {
    if (!file) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("country", country.code);
      formData.append("language", language);
      formData.append("notes", notes);

      const res = await fetch("/api/agents/invoice-reader", { method: "POST", body: formData });
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
        <p className="font-mono text-xs text-brass tracking-wider mb-2">ACCOUNTING / INVOICE READER</p>
        <h1 className="font-arabic text-2xl font-bold text-ink">قارئ الفواتير</h1>
        <p className="font-arabic text-sm text-ink-soft mt-1">
          حدّد الدولة واللغة، ارفع الفاتورة، وأضف أي ملاحظة — وبعدين ابدأ التحليل.
        </p>
      </div>

      <SectionCard step={1} title_ar="الدولة">
        <CountrySelector value={country.code} onChange={setCountry} />
      </SectionCard>

      <SectionCard step={2} title_ar="اللغة">
        <LanguageSelector value={language} onChange={setLanguage} />
      </SectionCard>

      <SectionCard step={3} title_ar="الملف">
        <FileUpload onFileSelected={setFile} />
      </SectionCard>

      <SectionCard step={4} title_ar="ملاحظات إضافية (اختياري)">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="مثلاً: هاي فاتورة اشتراك شهري متكرر"
          rows={3}
          className="w-full border border-hairline bg-paper font-arabic text-sm p-2 focus:outline-none focus:border-brass"
        />
      </SectionCard>

      <button
        onClick={handleSubmit}
        disabled={!file || status === "loading"}
        className="w-full bg-ink text-white font-arabic py-3 disabled:opacity-40"
      >
        {status === "loading" ? "جارِ التحليل..." : "ابدأ التحليل ←"}
      </button>

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
              { label_ar: "الإجمالي", value: `${result.output.total ?? 0} ${result.output.currency ?? ""}`, mono: true },
              { label_ar: "التصنيف", value: result.output.category || "—" },
              { label_ar: "القيد المقترح", value: `مدين: ${result.output.suggested_journal_entry?.debit_account || "—"}` },
            ]}
          />
        </div>
      )}
    </main>
  );
}
