// مطابقة دفعات USDT على شبكة TRON (TRC20). منطق صرف قابل للاختبار، والجلب عبر TronGrid المجاني.
export const USDT_TRC20 = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
export const isTronAddress = (a: string) => /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(a);

export type TronTransfer = { transaction_id: string; value: string; block_timestamp: number; to: string; token_info?: { decimals?: number; address?: string } };

// نحوّل المبلغ إلى وحدات صغرى (6 خانات) لنقارن بالأعداد الصحيحة لا بالكسور العشرية
export const toMicro = (amount: number | string) => Math.round(Number(amount) * 1e6);

// يبحث عن تحويل يطابق المبلغ تماماً، إلى محفظتنا، ضمن نافذة زمنية الطلب (لا قبل إنشائه ولا بعد انتهائه)
export function findMatchingTransfer(
  list: TronTransfer[],
  q: { wallet: string; amount: number | string; fromMs: number; toMs: number },
): TronTransfer | null {
  const want = toMicro(q.amount);
  for (const t of list) {
    if (!t || typeof t.transaction_id !== 'string' || t.to !== q.wallet) continue;
    if ((t.token_info?.decimals ?? 6) !== 6) continue;
    if (t.token_info?.address && t.token_info.address !== USDT_TRC20) continue;
    if (Number(t.value) !== want) continue;
    if (t.block_timestamp < q.fromMs || t.block_timestamp > q.toMs) continue;
    return t;
  }
  return null;
}

type FetchLike = (url: string, init: { headers: Record<string, string> }) => Promise<{ ok: boolean; json: () => Promise<unknown> }>;

// آخر التحويلات الواردة المؤكَّدة إلى المحفظة (مفتاح TronGrid اختياري لرفع الحد)
export async function fetchIncoming(wallet: string, apiKey?: string, f: FetchLike = fetch as unknown as FetchLike): Promise<TronTransfer[]> {
  const url = `https://api.trongrid.io/v1/accounts/${wallet}/transactions/trc20?only_to=true&only_confirmed=true&limit=50&contract_address=${USDT_TRC20}`;
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (apiKey) headers['TRON-PRO-API-KEY'] = apiKey;
  const r = await f(url, { headers });
  if (!r.ok) throw new Error('tron_unavailable');
  const j = (await r.json()) as { data?: unknown };
  return Array.isArray(j.data) ? (j.data as TronTransfer[]) : [];
}
