export function SectionCard({
  step, title_ar, children,
}: { step: number; title_ar: string; children: React.ReactNode }) {
  return (
    <div className="border border-hairline bg-paper-raised mb-4">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-hairline">
        <span className="font-mono text-xs text-brass border border-brass/30 w-5 h-5 flex items-center justify-center">
          {step}
        </span>
        <span className="font-arabic text-sm font-semibold text-ink">{title_ar}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
