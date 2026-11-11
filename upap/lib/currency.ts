// ============================================================
// تحويل العملات: سعر استرشادي من مصدر مجاني مع تاريخه، ولا يُعرض شيء إن فشل الجلب
// الأسعار لا تُكتب يدوياً في الكود أبداً
// ============================================================
export type Rates = { date: string; source: string; usd: Record<string, number> };

// المصدر الأساسي ثم الاحتياطي (نفس البنية: { date, usd: { eur: 0.9, ... } })
const SOURCES = [
  { name: 'fawazahmed0/currency-api (jsDelivr)', url: 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json' },
  { name: 'fawazahmed0/currency-api (Cloudflare Pages)', url: 'https://latest.currency-api.pages.dev/v1/currencies/usd.json' },
];

// يقبل البنية فقط إذا كانت سليمة؛ غير ذلك = null
export function parseRates(json: any, source: string): Rates | null {
  const table = json?.usd;
  const date = typeof json?.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(json.date) ? json.date : null;
  if (!date || !table || typeof table !== 'object') return null;
  const usd: Record<string, number> = { usd: 1 };
  for (const [k, v] of Object.entries(table)) if (typeof v === 'number' && Number.isFinite(v) && v > 0) usd[k.toLowerCase()] = v;
  return Object.keys(usd).length > 1 ? { date, source, usd } : null;
}

export async function fetchRates(fetchFn: typeof fetch = fetch): Promise<Rates | null> {
  for (const s of SOURCES) {
    try {
      const r = await fetchFn(s.url, { next: { revalidate: 3600 } } as RequestInit);
      if (!r.ok) continue;
      const parsed = parseRates(await r.json(), s.name);
      if (parsed) return parsed;
    } catch { /* ننتقل للمصدر التالي */ }
  }
  return null;
}

// المبلغ عبر الدولار: from → USD → to ؛ null إن غابت عملة
export function convert(amount: number, from: string, to: string, r: Rates): number | null {
  const a = r.usd[from.toLowerCase()], b = r.usd[to.toLowerCase()];
  if (!a || !b || !Number.isFinite(amount)) return null;
  return (amount / a) * b;
}

// الليرة السورية: الجديدة = 100 قديمة. وحدة السعر المُعاد غير معلنة من المصدر،
// فنحكم بالحجم: سعر الدولار ≥ 1000 يعني وحدة قديمة، وأقل منه يعني جديدة (الفرق بينهما 100 ضعف)
export function sypBoth(amountInSypUnits: number, usdSypRate: number): { old: number; neu: number } {
  const oldUnits = usdSypRate >= 1000;
  return oldUnits ? { old: amountInSypUnits, neu: amountInSypUnits / 100 } : { old: amountInSypUnits * 100, neu: amountInSypUnits };
}

// عدد الخانات العشرية حسب العملة (الدينار الكويتي 3 والليرة السورية 0 ...) من Intl نفسه
export function fmtMoney(n: number, cur: string, locale: string): string {
  try { return new Intl.NumberFormat(locale, { style: 'currency', currency: cur }).format(n); }
  catch { return `${n.toFixed(2)} ${cur}`; }
}
