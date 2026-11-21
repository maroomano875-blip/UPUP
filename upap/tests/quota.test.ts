import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { consumeQuota, refundQuota, isExempt, cleanTimeZone } from '../lib/quota';
import { identityKey } from '../lib/authPolicy';
import { quotaMessageKey } from '../lib/quotaMessages';
import { verifyAccessUser } from '../lib/authGate';
import { DICTS } from '../lib/i18n';

const u = { userId: '11111111-1111-1111-1111-111111111111', email: 'a@gmail.com', provider: 'google', tz: 'Asia/Damascus', agent: 'invoice-reader' };
const fakeDb = (data: unknown, error: { message: string } | null = null) => ({ rpc: async () => ({ data, error }) });

test('identityKey: يوحّد الأسماء المستعارة', () => {
  assert.equal(identityKey('A.B+tag@Gmail.com'), 'ab@gmail.com');
  assert.equal(identityKey('ab@googlemail.com'), 'ab@gmail.com');
  assert.equal(identityKey('x.y+1@outlook.com'), 'x.y@outlook.com');
});

test('isExempt: بالقائمة فقط ولا تكبير/تصغير', () => {
  assert.equal(isExempt('Owner@Gmail.com', 'owner@gmail.com, b@gmail.com'), true);
  assert.equal(isExempt('c@gmail.com', 'owner@gmail.com'), false);
  assert.equal(isExempt('c@gmail.com', undefined), false);
  assert.equal(isExempt('', 'owner@gmail.com'), false);
});

test('cleanTimeZone: صالح يمرّ وغير الصالح UTC', () => {
  assert.equal(cleanTimeZone('Asia/Riyadh'), 'Asia/Riyadh');
  assert.equal(cleanTimeZone('Not/AZone'), 'UTC');
  assert.equal(cleanTimeZone(42), 'UTC');
});

test('consumeQuota: التطبيق معطّل أو بلا هوية أو مستثنى = مسموح', async () => {
  assert.deepEqual(await consumeQuota(u, { enforce: false, db: fakeDb({ ok: false }) }), { ok: true });
  assert.deepEqual(await consumeQuota({ ...u, userId: null }, { enforce: true, db: fakeDb({ ok: false }) }), { ok: true });
  const prev = process.env.TRIAL_EXEMPT_EMAILS; process.env.TRIAL_EXEMPT_EMAILS = 'a@gmail.com';
  assert.deepEqual(await consumeQuota(u, { enforce: true, db: fakeDb({ ok: false }) }), { ok: true });
  if (prev === undefined) delete process.env.TRIAL_EXEMPT_EMAILS; else process.env.TRIAL_EXEMPT_EMAILS = prev;
});

test('consumeQuota: نجاح، تحليل اليوم مستعمل، انتهاء التجربة', async () => {
  assert.deepEqual(await consumeQuota(u, { enforce: true, db: fakeDb({ ok: true, event_id: 7 }) }), { ok: true, eventId: 7 });
  const daily = await consumeQuota(u, { enforce: true, db: fakeDb({ ok: false, reason: 'trial_daily_used', next_at: '2026-11-23T00:00:00+03:00' }) });
  assert.deepEqual(daily, { ok: false, status: 429, code: 'trial_daily_used', nextAt: '2026-11-23T00:00:00+03:00' });
  const ended = await consumeQuota(u, { enforce: true, db: fakeDb({ ok: false, reason: 'trial_ended' }) });
  assert.equal(ended.ok === false && ended.status, 403);
});

test('consumeQuota: عطل القاعدة = رفض (فشل مغلق) لا سماح', async () => {
  const r = await consumeQuota(u, { enforce: true, db: fakeDb(null, { message: 'boom' }) });
  assert.deepEqual(r, { ok: false, status: 503, code: 'quota_unavailable' });
});

test('consumeQuota: بريد بنطاق غير معروف عبر البريد مرفوض، وGoogle مقبول', async () => {
  const bad = await consumeQuota({ ...u, provider: 'email', email: 'x@mailinator.com' }, { enforce: true, db: fakeDb({ ok: true }) });
  assert.equal(bad.ok === false && bad.code, 'email_domain');
  const g = await consumeQuota({ ...u, provider: 'google', email: 'x@company.org' }, { enforce: true, db: fakeDb({ ok: true, event_id: 1 }) });
  assert.equal(g.ok, true);
});

test('refundQuota: يستدعي الدالة فقط عند وجود حدث وهوية', async () => {
  const calls: string[] = [];
  const db = { rpc: async (fn: string) => { calls.push(fn); return { data: null, error: null }; } };
  await refundQuota(undefined, u.userId, db); await refundQuota(5, null, db);
  assert.equal(calls.length, 0);
  await refundQuota(5, u.userId, db);
  assert.deepEqual(calls, ['refund_trial']);
});

test('verifyAccessUser: يقرأ البريد والمزوّد من Supabase', async () => {
  const f = async () => ({ ok: true, json: async () => ({ id: 'abcdefgh-1', email: ' A@Gmail.com ', app_metadata: { provider: 'google' } }) });
  assert.deepEqual(await verifyAccessUser('https://x.supabase.co', 'k', 't'.repeat(30), f), { id: 'abcdefgh-1', email: 'a@gmail.com', provider: 'google' });
  assert.equal(await verifyAccessUser('https://x.supabase.co', 'k', 't'.repeat(30), async () => ({ ok: false, json: async () => ({}) })), null);
});

test('quotaMessageKey + كل المفاتيح مترجمة بالثلاث لغات', () => {
  assert.equal(quotaMessageKey('trial_ended'), 'quota.trial_ended');
  assert.equal(quotaMessageKey('constructor'), null);
  assert.equal(quotaMessageKey(undefined), null);
  for (const k of ['quota.trial_ended', 'quota.trial_daily_used', 'quota.trial_already_used', 'quota.email_domain', 'quota.quota_unavailable', 'trial.chip.active', 'trial.state.available', 'trial.state.used', 'trial.chip.ended'])
    for (const l of ['ar', 'en', 'fr'] as const) assert.ok((DICTS[l] as Record<string, string>)[k], `${l}:${k}`);
});

const sql = readFileSync(join(__dirname, '..', 'supabase', 'migrations', '027_trial_quota.sql'), 'utf8');
const code = sql.split('\n').filter((l) => !l.trim().startsWith('--')).join('\n');

test('027: إضافة فقط، بلا حذف', () => {
  assert.doesNotMatch(code, /\bdrop\b|\btruncate\b|\bdelete\s+from\b/i);
});
test('027: دالتا الاستهلاك والاسترجاع للخادم فقط، لا للمتصفح', () => {
  assert.match(code, /revoke all on function consume_trial[^;]*from public, anon, authenticated/i);
  assert.match(code, /grant execute on function consume_trial[^;]*to service_role/i);
  assert.match(code, /revoke all on function refund_trial[^;]*from public, anon, authenticated/i);
  assert.doesNotMatch(code, /grant execute on function (consume_trial|refund_trial)[^;]*to (anon|authenticated|public)/i);
});
test('027: تحليل واحد يومياً لثلاثة أيام، وحماية الاسم المستعار والسباق', () => {
  assert.match(code, /today > t\.first_day \+ 2/);
  assert.match(code, /used >= 1/);
  assert.match(code, /for update/i);
  assert.match(code, /create unique index if not exists uq_trials_identity/i);
  assert.match(code, /refunded boolean not null default false/i);
});
test('الاستهلاك يتم بعد قراءة الملف وقبل الذكاء الاصطناعي، والاسترجاع عند الفشل', () => {
  const r = readFileSync(join(__dirname, '..', 'lib', 'agentRoute.ts'), 'utf8');
  assert.ok(r.indexOf('readUpload(') < r.indexOf('consumeQuota('));
  assert.ok(r.indexOf('consumeQuota(') < r.indexOf('agent.run('));
  assert.match(r, /refundQuota\(quota\.eventId, userId\)/);
});
