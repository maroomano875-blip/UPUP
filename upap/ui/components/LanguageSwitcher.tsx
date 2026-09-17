"use client";
// ==========================================================
// مبدّل اللغة والدولة — يظهر بكل صفحات المنصة
// ==========================================================
import { useState } from "react";

interface LanguageOption {
  code: string;       // en-US, ar-SA...
  label_ar: string;
  label_native: string;
  flag: string;
}

const DEFAULT_LANGUAGES: LanguageOption[] = [
  { code: "ar-SY", label_ar: "العربية (سوريا)", label_native: "العربية", flag: "🇸🇾" },
  { code: "ar-SA", label_ar: "العربية (السعودية)", label_native: "العربية", flag: "🇸🇦" },
  { code: "en-US", label_ar: "الإنجليزية (أمريكا)", label_native: "English", flag: "🇺🇸" },
  { code: "en-GB", label_ar: "الإنجليزية (بريطانيا)", label_native: "English", flag: "🇬🇧" },
];

interface LanguageSwitcherProps {
  current: string;
  onChange: (code: string) => void;
  options?: LanguageOption[];
}

export function LanguageSwitcher({ current, onChange, options = DEFAULT_LANGUAGES }: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false);
  const active = options.find((o) => o.code === current) ?? options[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 border border-hairline bg-paper-raised px-3 py-1.5 font-arabic text-sm"
      >
        <span>{active.flag}</span>
        <span>{active.label_native}</span>
      </button>

      {open && (
        <ul className="absolute mt-1 border border-hairline bg-paper-raised shadow-sm z-10 min-w-[180px]">
          {options.map((opt) => (
            <li
              key={opt.code}
              onClick={() => { onChange(opt.code); setOpen(false); }}
              className={`flex items-center gap-2 px-3 py-2 font-arabic text-sm cursor-pointer hover:bg-paper
                ${opt.code === current ? "text-brass" : "text-ink"}`}
            >
              <span>{opt.flag}</span>
              <span>{opt.label_native}</span>
              <span className="text-xs text-ink-soft mr-auto">{opt.label_ar}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
