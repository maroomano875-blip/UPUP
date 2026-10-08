"use client";
import { useState } from "react";

export interface CountryOption {
  code: string;
  name_ar: string;
  flag: string;
  currency: string;
}

export const SUPPORTED_COUNTRIES: CountryOption[] = [
  { code: "US", name_ar: "الولايات المتحدة", flag: "🇺🇸", currency: "USD" },
  { code: "GB", name_ar: "بريطانيا", flag: "🇬🇧", currency: "GBP" },
  { code: "SA", name_ar: "السعودية", flag: "🇸🇦", currency: "SAR" },
  { code: "AE", name_ar: "الإمارات", flag: "🇦🇪", currency: "AED" },
  { code: "EG", name_ar: "مصر", flag: "🇪🇬", currency: "EGP" },
  { code: "SY", name_ar: "سوريا", flag: "🇸🇾", currency: "SYP" },
];

interface CountrySelectorProps {
  value: string;
  onChange: (country: CountryOption) => void;
  options?: CountryOption[];
}

export function CountrySelector({ value, onChange, options = SUPPORTED_COUNTRIES }: CountrySelectorProps) {
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
        <span className="text-ink flex-1 text-right">{active.name_ar}</span>
        <span className="font-mono text-xs text-brass">{active.currency}</span>
      </button>
      {open && (
        <ul className="absolute z-10 mt-1 w-full border border-hairline bg-paper-raised shadow-sm">
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
