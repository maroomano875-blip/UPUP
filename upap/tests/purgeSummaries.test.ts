import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { purgeExpiredSummaries, type PurgeDb } from '../lib/purgeSummaries';

const fake = (log: string[], count = 3, error: { message: string } | null = null): PurgeDb => ({
  from: (t) => ({
    select: () => ({ lt: async (c, v) => { log.push(`count ${t}.${c}<${v}`); return { count, error }; } }),
    delete: () => ({ lt: async (c, v) => { log.push(`delete ${t}.${c}<${v}`); return { count, error }; } }),
  }),
});
const now = new Date('2026-12-01T00:00:00Z');

test('الحذف يخص analysis_summaries والمنتهي فقط', async () => {
  const log: string[] = [];
  const r = await purgeExpiredSummaries(fake(log), { now });
  assert.deepEqual(r, { ok: true, dry: false, count: 3 });
  assert.deepEqual(log, ['delete analysis_summaries.expires_at<2026-12-01T00:00:00.000Z']);
});

test('وضع التجربة يعدّ ولا يحذف', async () => {
  const log: string[] = [];
  const r = await purgeExpiredSummaries(fake(log, 5), { dry: true, now });
  assert.equal(r.count, 5);
  assert.ok(log.every((l) => l.startsWith('count ')));
});

test('الخطأ يُرجع ok=false بلا عدّ', async () => {
  const r = await purgeExpiredSummaries(fake([], 0, { message: 'boom' }), { now });
  assert.deepEqual(r, { ok: false, dry: false, count: 0, error: 'boom' });
});

test('المهمة مجدولة، والمسار محمي بالسر إن وُجد ولا يحذف غير هذا الجدول', () => {
  const v = JSON.parse(readFileSync(join(__dirname, '..', 'vercel.json'), 'utf8'));
  assert.ok(v.crons.some((c: { path: string }) => c.path === '/api/cleanup'));
  const route = readFileSync(join(__dirname, '..', 'app', 'api', 'cleanup', 'route.ts'), 'utf8');
  assert.match(route, /CRON_SECRET/);
  const lib = readFileSync(join(__dirname, '..', 'lib', 'purgeSummaries.ts'), 'utf8');
  assert.equal((lib.match(/from\('/g) ?? []).length, 2);
  assert.ok(!/from\('(?!analysis_summaries)/.test(lib));
});
