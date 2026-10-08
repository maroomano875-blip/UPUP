import Link from "next/link";

const PROFESSIONS = [
  { href: "/professions/accounting/invoice-reader", icon: "📊", name_ar: "محاسبة", name_en: "Accounting", desc: "قارئ الفواتير — استخراج بيانات وقيود تلقائياً", status: "LIVE" },
  { href: "/professions/law/contract-reviewer", icon: "⚖️", name_ar: "محاماة", name_en: "Law", desc: "مراجع العقود — تحليل البنود ومستوى الخطورة", status: "LIVE" },
];

export default function HomePage() {
  return (
    <main dir="rtl">
      {/* Hero */}
      <section className="bg-slate border-b-2 border-brass px-6 py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-px bg-brass" />
            <span className="font-mono text-xs text-brass tracking-widest">UNIVERSAL PROFESSIONS AI PLATFORM</span>
          </div>
          <h1 className="font-arabic text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
            نظام تشغيل المهن
          </h1>
          <p className="font-arabic text-white/60 max-w-md leading-relaxed mb-10">
            منصة واحدة لكل مهنة — وكلاء ذكاء اصطناعي يفهمون قوانين بلدك ولغتك، مع مراجعة مزدوجة لكل نتيجة.
          </p>
          <div className="flex gap-8 pt-6 border-t border-white/10">
            <div>
              <p className="font-mono text-xl text-brass">{PROFESSIONS.length}</p>
              <p className="font-arabic text-xs text-white/40">مهنة فعّالة</p>
            </div>
            <div>
              <p className="font-mono text-xl text-brass">6</p>
              <p className="font-arabic text-xs text-white/40">دول مدعومة</p>
            </div>
            <div>
              <p className="font-mono text-xl text-brass">0$</p>
              <p className="font-arabic text-xs text-white/40">رأس مال مطلوب</p>
            </div>
          </div>
        </div>
      </section>

      {/* Professions docket */}
      <section className="px-6 py-12 max-w-3xl mx-auto">
        <p className="font-mono text-xs text-brass tracking-widest mb-4">اختر المهنة</p>
        <div className="border border-hairline">
          {PROFESSIONS.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="flex items-center gap-4 px-5 py-5 border-b border-hairline last:border-b-0 hover:bg-paper-raised transition-colors"
            >
              <span className="text-2xl">{p.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-arabic font-bold text-ink">{p.name_ar}</span>
                  <span className="font-mono text-[10px] text-ink-soft">{p.name_en}</span>
                </div>
                <p className="font-arabic text-xs text-ink-soft mt-0.5">{p.desc}</p>
              </div>
              <span className="font-mono text-[10px] text-forest border border-forest/30 px-2 py-0.5">{p.status}</span>
              <span className="text-brass">←</span>
            </Link>
          ))}
        </div>
      </section>

      <footer className="px-6 py-6 text-center">
        <p className="font-mono text-[10px] text-ink-soft/50 tracking-wider">UPAP CORE — BUILT FROM A PHONE</p>
      </footer>
    </main>
  );
}
