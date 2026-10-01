"use client";
// ==========================================================
// مبدّل الدولة — يحدد فعلياً اللغة والعملة اللي بترسل للوكيل
// (مو مجرد ديكور — القيمة المختارة هون بتغيّر سلوك الطلب)
// ==========================================================
import { useState } from "react";

export interface CountryOption {
  code: string;        // US, SA, SY...
  name_ar: string;
  flag: string;
  language: string;    // en-US, ar-SA... يُرسل للوكيل
  currency: string;    // USD, SAR...
}

// نفس الدول المدعومة فعلياً بإعدادات الوكلاء (core/types/agent.ts)
export const SUPPORTED_COUNTRIES: CountryOption[] = [
  { code: "US", name_ar: "الولايات المتحدة", flag: "🇺🇸", language: "en-US", currency: "USD" },
  { code: "GB", name_ar: "بريطانيا", flag: "🇬🇧", language: "en-GB", currency: "GBP" },
  { code: "SA", name_ar: "السعودية", flag: "🇸🇦", language: "ar-SA", currency: "SAR" },
  { code: "AE", name_ar: "الإمارات", flag: "🇦🇪", language: "ar", currency: "AED" },
  { code: "EG", name_ar: "مصر", flag: "🇪🇬", language: "ar-EG", currency: "EGP" },
  { code: "SY", name_ar: "سوريا", flag: "🇸🇾", language: "ar-SY", currency: "SYP" },
];

interface CountrySelectorProps {
  value: string;                              // كود الدولة الحالي
  onChange: (country: CountryOption) => void;
  options?: CountryOption[];
}

export function CountrySelector({ value, onChange, options = SUPPORTED_COUNTRIES }: CountrySelectorProps) {
  const [open, setOpen] = useState(false);
  const active = options.find((o) => o.code === value) ?? options[0];

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 border border-hairline bg-paper-raised px-3 py-2 font-arabic text-sm hover:border-brass/60"
      >
        <span>{active.flag}</span>
        <span className="text-ink">{active.name_ar}</span>
        <span className="font-mono text-xs text-brass">{active.currency}</span>
      </button>

      {open && (
        <ul className="absolute z-10 mt-1 border border-hairline bg-paper-raised shadow-sm min-w-[220px]">
          {options.map((opt) => (
            <li
              key={opt.code}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`flex items-center gap-2 px-3 py-2 font-arabic text-sm cursor-pointer hover:bg-paper border-b border-hairline last:border-b-0
                ${opt.code === value ? "text-brass" : "text-ink"}`}
            >
              <span>{opt.flag}</span>
              <span className="flex-1">{opt.name_ar}</span>
              <span className="font-mono text-xs text-ink-soft">{opt.currency}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
