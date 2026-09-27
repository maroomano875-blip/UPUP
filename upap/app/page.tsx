// ==========================================================
// الصفحة الرئيسية — نسخة بسيطة أولى قبل بناء الصدفة الكاملة
// ==========================================================
import Link from "next/link";

export default function HomePage() {
  return (
    <main dir="rtl" className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="font-mono text-xs text-brass tracking-wider mb-3">UPAP CORE</p>
        <h1 className="font-arabic text-3xl font-bold text-ink mb-3">نظام تشغيل المهن</h1>
        <p className="font-arabic text-ink-soft mb-8">
          وكيلان جاهزان للتجربة — المحاسبة والمحاماة.
        </p>
        <div className="flex flex-col gap-3 items-center">
          <Link
            href="/professions/accounting/invoice-reader"
            className="inline-block bg-ink text-white font-arabic px-6 py-3 w-full max-w-xs text-center"
          >
            📊 قارئ الفواتير ←
          </Link>
          <Link
            href="/professions/law/contract-reviewer"
            className="inline-block bg-ink text-white font-arabic px-6 py-3 w-full max-w-xs text-center"
          >
            ⚖️ مراجع العقود ←
          </Link>
        </div>
      </div>
    </main>
  );
}
