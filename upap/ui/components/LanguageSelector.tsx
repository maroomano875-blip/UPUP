"use client";
// ==========================================================
// مبدّل اللغة — منفصل عن الدولة، يحدد لغة البرومبت المُرسل للوكيل
// ==========================================================
import { useState } from "react";

export interface LanguageOption {
  code: string;      // ar-SY, ar-SA, ar, en-US, en-GB
  label_ar: string;
  label_native: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "ar-SY", label_ar: "العربية (سوريا)", label_native: "العربية", flag: "🇸🇾" },
  { code: "ar-SA", label_ar: "العربية (السعودية)", label_native: "العربية", flag: "🇸🇦" },
  { code: "ar-EG", label_ar: "العربية (مصر)", label_native: "العربية", flag: "🇪🇬" },
  { code: "ar", label_ar: "العربية (فصحى)", label_native: "العربية", flag: "🌐" },
  { code: "en-US", label_ar: "الإنجليزية (أمريكا)", label_native: "English", flag: "🇺🇸" },
  { code: "en-GB", label_ar: "الإنجليزية (بريطانيا)", label_native: "English", flag: "🇬🇧" },
];

interface LanguageSelectorProps {
  value: string;
  onChange: (code: string) => void;
  options?: LanguageOption[];
}

export function LanguageSelector({ value, onChange, options = SUPPORTED_LANGUAGES }: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const active = options.find((o) => o.code === value) ?? options[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 border border-hairline bg-paper px-3 py-2.5 font-arabic text-sm hover:border-brass/60"
      >
        <span>{active.flag}</span>
        <span className="text-ink flex-1 text-right">{active.label_ar}</span>
      </button>
      {open && (
        <ul className="absolute z-10 mt-1 w-full border border-hairline bg-paper-raised shadow-sm">
          {options.map((opt) => (
            <li
              key={opt.code}
              onClick={() => { onChange(opt.code); setOpen(false); }}
              className={`flex items-center gap-2 px-3 py-2 font-arabic text-sm cursor-pointer hover:bg-paper border-b border-hairline last:border-b-0
                ${opt.code === value ? "text-brass" : "text-ink"}`}
            >
              <span>{opt.flag}</span>
              <span className="flex-1">{opt.label_ar}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
