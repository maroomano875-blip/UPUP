import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { consumeQuota, refundQuota } from '../lib/quota';
import { quotaMessageKey } from '../lib/quotaMessages';
import { DICTS } from '../lib/i18n';

const code = readFileSync(join(__dirname, '..', 'supabase', 'migrations', '033_plan_quota.sql'), 'utf8')
  .split('\n').filter((l) => !l.trim().startsWith('--')).join('\n');

test('033: دوال الحصة للخادم فقط وبلا حذف', () => {
  for (const f of ['consume_plan(uuid, text)', 'refund_plan(bigint, uuid)', 'plan_status_for(uuid)']) {
    assert.ok(code.includes(`grant execute on function ${f} to service_role`), f);
  }
  assert.doesNotMatch(code, /grant execute[^;]*(anon|public|authenticated)/i);
  assert.doesNotMatch(code, /drop (table|column|function|trigger|policy)|delete from|truncate/i);
});

test('033: الأسبوعي ربع الشهري والشهري/السنوي حد الشهر، مع قفل لمنع التجاوز المتزامن', () => {
  assert.match(code, /monthly_analyses \/ 4/);
  assert.match(code, /pg_advisory_xact_lock/);
  assert.match(code, /s\.started_at <= now\(\) and s\.expires_at > now\(\)/);
  assert.match(code, /e\.kind = 'plan' and not e\.refunded/);
});

const u = { userId: '11111111-1111-1111-1111-111111111111', email: 'a@gmail.com', provider: 'google', tz: 'UTC', agent: 'x' };
const byFn = (m: Record<string, unknown>) => ({ rpc: async (fn: string) => ({ data: m[fn] ?? null, error: null }) });

test('consumeQuota: مشترك يُخصم من خطته ولا يمسّ التجربة', async () => {
  const r = await consumeQuota(u, { enforce: true, db: byFn({ consume_plan: { ok: true, has_plan: true, event_id: 5 }, consume_trial: { ok: false, reason: 'trial_ended' } }) });
  assert.deepEqual(r, { ok: true, eventId: 5, kind: 'plan' });
});

test('consumeQuota: استهلك حصة الخطة = 429 برمز plan_quota_used', async () => {
  const r = await consumeQuota(u, { enforce: true, db: byFn({ consume_plan: { ok: false, has_plan: true, reason: 'plan_quota_used', next_at: '2026-12-01T00:00:00Z' } }) });
  assert.deepEqual(r, { ok: false, status: 429, code: 'plan_quota_used', nextAt: '2026-12-01T00:00:00Z' });
});

test('consumeQuota: بلا خطة يكمل لمسار التجربة', async () => {
  const r = await consumeQuota(u, { enforce: true, db: byFn({ consume_plan: { ok: false, has_plan: false }, consume_trial: { ok: true, event_id: 9 } }) });
  assert.deepEqual(r, { ok: true, eventId: 9, kind: 'trial' });
});

test('consumeQuota: عطل فحص الخطة = رفض مغلق', async () => {
  const db = { rpc: async () => ({ data: null, error: { message: 'boom' } }) };
  assert.deepEqual(await consumeQuota(u, { enforce: true, db }), { ok: false, status: 503, code: 'quota_unavailable' });
});

test('refundQuota: يستدعي دالة الاسترجاع المناسبة لنوع الحصة', async () => {
  const calls: string[] = [];
  const db = { rpc: async (fn: string) => { calls.push(fn); return { data: null, error: null }; } };
  await refundQuota(3, u.userId, db, 'plan');
  await refundQuota(4, u.userId, db);
  assert.deepEqual(calls, ['refund_plan', 'refund_trial']);
});

test('رسالة plan_quota_used وplan.chip موجودتان بالثلاث لغات', () => {
  assert.equal(quotaMessageKey('plan_quota_used'), 'quota.plan_quota_used');
  for (const l of ['ar', 'en', 'fr'] as const) {
    const d = DICTS[l] as Record<string, string>;
    assert.ok(d['quota.plan_quota_used'] && d['plan.chip'], l);
  }
});
