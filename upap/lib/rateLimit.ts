// حدّ طلبات بسيط في الذاكرة (نافذة ثابتة). يعمل لكل نسخة خادم على حدة (best-effort)، يكفي لصدّ الإغراق العرضي مجاناً.
type Bucket = { n: number; reset: number };
const buckets = new Map<string, Bucket>();

export function hit(key: string, max: number, windowMs: number, now = Date.now()): boolean {
  if (buckets.size > 5000) for (const [k, b] of buckets) if (b.reset <= now) buckets.delete(k);
  const b = buckets.get(key);
  if (!b || b.reset <= now) { buckets.set(key, { n: 1, reset: now + windowMs }); return true; }
  b.n += 1;
  return b.n <= max;
}

export const clientIp = (req: Request): string =>
  (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown').split(',')[0].trim();

export const _reset = () => buckets.clear();
