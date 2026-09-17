// ==========================================================
// مكون سجل المراجعة — يعرض كل خطوة اتخذها الوكيل (الشفافية)
// ==========================================================

interface AuditEntry {
  step: string;
  message: string;
  timestamp: string;
}

const STEP_LABELS_AR: Record<string, string> = {
  received: "استلام الطلب",
  parsing: "قراءة الملف",
  ai_call: "استدعاء الذكاء الاصطناعي",
  review: "المراجعة المزدوجة",
  delivered: "التسليم",
  error: "خطأ",
};

export function AuditTrail({ entries }: { entries: AuditEntry[] }) {
  return (
    <div className="border border-hairline bg-paper-raised">
      <div className="px-5 py-3 border-b border-hairline">
        <h4 className="font-mono text-xs text-brass tracking-wider">AUDIT TRAIL</h4>
      </div>
      <ol className="relative">
        {entries.map((entry, i) => (
          <li
            key={i}
            className="flex gap-4 px-5 py-3 border-b border-hairline last:border-b-0"
          >
            <span className="font-mono text-xs text-ink-soft w-16 shrink-0 pt-0.5">
              {new Date(entry.timestamp).toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" })}
            </span>
            <div>
              <p className="font-arabic text-sm font-semibold text-ink">
                {STEP_LABELS_AR[entry.step] ?? entry.step}
              </p>
              <p className="font-arabic text-xs text-ink-soft mt-0.5">{entry.message}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
