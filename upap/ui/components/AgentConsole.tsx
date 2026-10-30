// لوحة توضيحية ثابتة: شكل ما يجري داخل الوكيل (مثال، ليست نتيجة حقيقية).
const Line = ({ k, v, c }: { k?: string; v: string; c?: string }) => (
  <div className="leading-8">{k && <span className="text-[#94a3b8]">{k}: </span>}<span style={{ color: c ?? '#f1f5f9' }}>{v}</span></div>
);
export default function AgentConsole() {
  return (
    <section dir="ltr" aria-label="مثال توضيحي لعمل الوكيل" className="overflow-hidden rounded-xl border border-[rgba(255,255,255,0.12)] bg-[#050b18] font-mono text-sm">
      <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.1)] bg-[#0c1426] px-4 py-3 text-xs text-[#94a3b8]">
        <span>UPAP Agent Console — accounting.invoice-reader</span>
        <span className="flex gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#ef4444]" /><i className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]" /><i className="h-2.5 w-2.5 rounded-full bg-[#22c55e]" /></span>
      </div>
      <div className="px-4 py-4">
        <Line v={'agent.run({country:"US", lang:"en-US"}) ►'} c="#e0b45a" />
        <Line k="[parsing]" v="invoice-feb-2025.pdf" />
        <div className="my-2 h-1 rounded bg-[#1e293b]"><div className="h-1 w-3/5 rounded bg-[#d4a24a]" /></div>
        <Line k="[ai_call]" v="provider → model (auto-selected)" />
        <Line k="[extract] vendor" v="Example Cloud Ltd." />
        <Line k="total" v="$2,847.00 USD" c="#e0b45a" />
        <Line k="tax" v="$0.00 (B2B exempt)" />
        <Line k="[review]" v="reviewer-agent cross-checking…" />
        <Line k="[journal]" v="Dr. Cloud Expenses / Cr. Accounts Payable" />
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="rounded border border-[rgba(212,162,74,0.5)] bg-[rgba(212,162,74,0.1)] px-3 py-1.5 text-[#e0b45a]">confidence 94%</span>
          <span className="rounded border border-[rgba(34,197,94,0.5)] bg-[rgba(34,197,94,0.1)] px-3 py-1.5 text-[#6ee7b7]">delivered ✓</span>
        </div>
        <p className="mt-3 text-xs text-[#94a3b8]">مثال توضيحي لسير العمل، وليس نتيجة فعلية.</p>
      </div>
    </section>
  );
}
