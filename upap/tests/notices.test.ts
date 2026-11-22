import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DICTS } from '../lib/i18n';
import { officeErrorKey } from '../lib/officePolicy';

const read = (...p: string[]) => readFileSync(join(__dirname, '..', ...p), 'utf8');
const strip = (s: string) => s.split('\n').filter((l) => !l.trim().startsWith('--')).join('\n');
const sql = strip(read('supabase', 'migrations', '028_member_limits_trial_status.sql'));

test('028: بلا حذف ولا تعديل جداول، ودوال الحد للخادم أو للمسجَّلين فقط', () => {
  assert.doesNotMatch(sql, /\bdrop\b|\btruncate\b|\bdelete\s+from\b|\balter\s+table\b/i);
  assert.match(sql, /revoke all on function office_member_limit[^;]*from public, anon, authenticated/i);
  assert.match(sql, /grant execute on function office_member_limit[^;]*to service_role/i);
  assert.match(sql, /revoke all on function trial_status_for[^;]*from public, anon, authenticated/i);
  assert.doesNotMatch(sql, /grant execute[^;]*(office_member_limit|trial_status_for)[^;]*to (anon|authenticated|public)/i);
  assert.match(sql, /grant execute on function my_office_limits\(uuid\) to authenticated/i);
});

test('028: حد الأعضاء صارم في الدعوة والانضمام (مع قفل المكتب)، والافتراضي 1 بلا اشتراك', () => {
  assert.match(sql, /coalesce\(\(\s*select max\(p\.max_members\)[\s\S]*?\), 1\)/i);
  assert.equal((sql.match(/raise exception 'member_limit'/g) ?? []).length, 2);
  assert.equal((sql.match(/from offices where id = (p_office|inv\.office_id) for update/g) ?? []).length, 2);
  assert.match(sql, /if mem \+ pend >= lim then\s*raise exception 'member_limit'/i);
  assert.match(sql, /if mem >= lim then\s*raise exception 'member_limit'/i);
});

test('028: الاشتراك الفعّال فقط (status active وغير منتهٍ) يرفع الحد', () => {
  assert.match(sql, /s\.status = 'active' and \(s\.expires_at is null or s\.expires_at > now\(\)\)/i);
});

test('الإشعارات: كل مفاتيح الترجمة موجودة بالثلاث لغات', () => {
  const keys = ['notice.welcome.new.title', 'notice.welcome.new.body', 'notice.welcome.active.title', 'notice.welcome.active.avail', 'notice.welcome.active.used',
    'notice.welcome.done.title', 'notice.welcome.done.body', 'notice.try.1', 'notice.try.2', 'notice.try.3', 'notice.try.next', 'notice.try.last', 'notice.subscribe',
    'nudge.title', 'nudge.body', 'nudge.later', 'plans.title', 'plans.sub', 'plans.trialNote', 'plans.members', 'plans.analyses', 'plans.priceSoon', 'plans.cta',
    'plans.small', 'plans.medium', 'plans.large', 'office.limit.label', 'office.limit.pending', 'office.limit.full.title', 'office.limit.full.body', 'office.limit.upgrade',
    'office.err.member_limit', 'toast.office.created', 'toast.office.joined', 'toast.invite.ready', 'toast.invite.ready.body', 'toast.copied', 'toast.removed'];
  for (const k of keys) for (const l of ['ar', 'en', 'fr'] as const) assert.ok((DICTS[l] as Record<string, string>)[k], `${l}:${k}`);
});

test('خطأ حد الأعضاء يُترجم لمفتاحه', () => {
  assert.equal(officeErrorKey('member_limit'), 'office.err.member_limit');
});

test('/api/me: يتحقق من الرمز ويعطّل التجربة للمستثنين، ولا يُخزَّن', () => {
  const r = read('app', 'api', 'me', 'route.ts');
  assert.match(r, /verifyAccessUser\(/);
  assert.match(r, /isExempt\(user\.email\)/);
  assert.match(r, /status: 401/);
  assert.match(r, /no-store/);
});

test('الواجهة ترسل أحداث التحليل والانتهاء، وتاريخ التجديد بلغة الواجهة لا لغة الدولة', () => {
  const h = read('ui', 'components', 'ProfessionHub.tsx');
  assert.match(h, /dispatchEvent\(new Event\('upap:analysis-done'\)\)/);
  assert.match(h, /dispatchEvent\(new Event\('upap:trial-ended'\)\)/);
  assert.match(h, /toLocaleString\(ui,/);
  assert.doesNotMatch(h, /new Date\(nx\)\.toLocaleString\(lang/);
});
