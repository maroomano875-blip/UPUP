// ==========================================================
// شارة عملة صغيرة — تُستخدم جنب أي مبلغ لتوضيح سياق الدولة
// ==========================================================

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", GBP: "£", SAR: "ر.س", AED: "د.إ", EGP: "ج.م", SYP: "ل.س",
};

export function CurrencyDisplay({ currency, amount }: { currency: string; amount?: number }) {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
  return (
    <span className="font-mono text-xs border border-hairline px-2 py-0.5 text-ink-soft">
      {amount !== undefined ? `${amount.toLocaleString()} ` : ""}{symbol}
      <span className="text-brass mr-1">{currency}</span>
    </span>
  );
}
