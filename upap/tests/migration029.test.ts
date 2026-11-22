import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { officeErrorKey } from '../lib/officePolicy';
import { DICTS } from '../lib/i18n';

const code = readFileSync(join(__dirname, '..', 'supabase', 'migrations', '029_pricing_orders.sql'), 'utf8')
  .split('\n').filter((l) => !l.trim().startsWith('--')).join('\n');

test('029: الأسعار المعتمدة', () => {
  assert.match(code, /'individual'[^;]*3,\s*price_monthly_usdt = 8,\s*price_yearly_usdt = 72|price_weekly_usdt = 3,\s*price_monthly_usdt = 8,\s*price_yearly_usdt = 72/);
  assert.match(code, /price_weekly_usdt = 5,\s*price_monthly_usdt = 15,\s*price_yearly_usdt = 135/);
  assert.match(code, /price_weekly_usdt = 9,\s*price_monthly_usdt = 29,\s*price_yearly_usdt = 261/);
  assert.match(code, /price_weekly_usdt = 19,\s*price_monthly_usdt = 59,\s*price_yearly_usdt = 531/);
});

test('029: إنشاء الطلب للخادم فقط وبلا حذف', () => {
  assert.match(code, /grant execute on function create_payment_order\(uuid, text, text\) to service_role/i);
  assert.doesNotMatch(code, /grant execute[^;]*to (anon|public|authenticated)/i);
  assert.doesNotMatch(code, /drop (table|column|function|trigger|policy)|delete from|truncate/i);
  assert.match(code, /security definer set search_path = public/i);
});

test('029: قفل الفردي ومفتاح الخطأ مترجم', () => {
  assert.match(code, /before insert on office_members/i);
  assert.equal(officeErrorKey('individual_plan'), 'office.err.individual_plan');
  for (const l of ['ar', 'en', 'fr'] as const) assert.ok((DICTS[l] as Record<string, string>)['office.err.individual_plan']);
});
