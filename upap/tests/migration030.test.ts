import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const code = readFileSync(join(__dirname, '..', 'supabase', 'migrations', '030_activate_payment.sql'), 'utf8')
  .split('\n').filter((l) => !l.trim().startsWith('--')).join('\n');

test('030: التفعيل للخادم فقط ومرة واحدة وبقفل الصف', () => {
  assert.match(code, /grant execute on function activate_payment\(uuid, text\) to service_role/i);
  assert.doesNotMatch(code, /grant execute on function activate_payment[^;]*(anon|public|authenticated)/i);
  assert.match(code, /for update/i);
  assert.match(code, /o\.status = 'paid'/);
});

test('030: سجل تدقيق وإشعار عند التفعيل، وبلا حذف', () => {
  assert.match(code, /insert into billing_audit/i);
  assert.match(code, /insert into notifications/i);
  assert.doesNotMatch(code, /drop (table|column|function|trigger|policy)|delete from|truncate/i);
});

test('030: الدوال المكشوفة للمسجَّلين فقط ولا تُمنح للزوار', () => {
  assert.match(code, /grant execute on function my_subscription\(\) to authenticated/i);
  assert.match(code, /grant execute on function mark_notifications_read\(\) to authenticated/i);
  assert.doesNotMatch(code, /grant execute[^;]*to (anon|public)/i);
});
