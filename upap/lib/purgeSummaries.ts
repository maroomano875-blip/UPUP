// حذف ملخصات التحليل المنتهية (30 يوماً). يحذف من جدول analysis_summaries فقط وما انتهت صلاحيته فقط.
// وضع التجربة (dry) يعدّ ولا يحذف. أي عطل يُرجع خطأ دون حذف جزئي مخفي.
type Del = { lt: (col: string, v: string) => PromiseLike<{ count: number | null; error: { message: string } | null }> };
type Sel = { lt: (col: string, v: string) => PromiseLike<{ count: number | null; error: { message: string } | null }> };
export type PurgeDb = {
  from: (t: string) => {
    select: (cols: string, o: { count: 'exact'; head: true }) => Sel;
    delete: (o: { count: 'exact' }) => Del;
  };
};

export async function purgeExpiredSummaries(db: PurgeDb, opts: { dry?: boolean; now?: Date } = {}): Promise<{ ok: boolean; dry: boolean; count: number; error?: string }> {
  const cutoff = (opts.now ?? new Date()).toISOString();
  const dry = !!opts.dry;
  const r = dry
    ? await db.from('analysis_summaries').select('id', { count: 'exact', head: true }).lt('expires_at', cutoff)
    : await db.from('analysis_summaries').delete({ count: 'exact' }).lt('expires_at', cutoff);
  if (r.error) return { ok: false, dry, count: 0, error: r.error.message };
  return { ok: true, dry, count: r.count ?? 0 };
}
