// ==========================================================
// مكون عرض النتيجة — بأسلوب "الدفتر" (سطور مفصولة بخط رفيع)
// ==========================================================

interface ResultField {
  label_ar: string;
  value: string | number;
  mono?: boolean;           // للأرقام والرموز (مبالغ، أرقام فواتير)
}

interface ResultCardProps {
  title_ar: string;
  confidence: number;       // 0 إلى 1
  fields: ResultField[];
  warnings?: string[];
}

export function ResultCard({ title_ar, confidence, fields, warnings = [] }: ResultCardProps) {
  const confidenceColor =
    confidence >= 0.85 ? "text-forest" : confidence >= 0.6 ? "text-brass" : "text-oxblood";

  return (
    <div className="border border-hairline bg-paper-raised">
      <div className="flex items-center justify-between px-5 py-3 border-b border-hairline">
        <h3 className="font-arabic font-bold text-ink">{title_ar}</h3>
        <span className={`font-mono text-xs ${confidenceColor}`}>
          {Math.round(confidence * 100)}% ثقة
        </span>
      </div>

      <div>
        {fields.map((field, i) => (
          <div
            key={i}
            className="flex items-center justify-between px-5 py-2.5 border-b border-hairline last:border-b-0"
          >
            <span className="font-arabic text-sm text-ink-soft">{field.label_ar}</span>
            <span className={`text-sm text-ink ${field.mono ? "font-mono" : "font-body"}`}>
              {field.value}
            </span>
          </div>
        ))}
      </div>

      {warnings.length > 0 && (
        <div className="px-5 py-3 bg-oxblood/5 border-t border-oxblood/20">
          {warnings.map((w, i) => (
            <p key={i} className="font-arabic text-xs text-oxblood">⚠ {w}</p>
          ))}
        </div>
      )}
    </div>
  );
}
