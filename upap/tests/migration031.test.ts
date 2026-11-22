import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const rd = (f: string) => readFileSync(join(__dirname, '..', 'supabase', 'migrations', f), 'utf8').split('\n').filter((l) => !l.trim().startsWith('--')).join('\n');

test('031/029: لا غموض بين أعمدة الجدول ومخرجات الدالة (expires_at مؤهَّل)', () => {
  for (const f of ['029_pricing_orders.sql', '031_fix_create_order.sql']) {
    const c = rd(f);
    assert.match(c, /update payment_orders po set status = 'expired' where po\.status = 'pending' and \(po\.expires_at <= now\(\)/, f);
    assert.doesNotMatch(c, /where status = 'pending' and \(expires_at/, f);
  }
});

test('031: الدالة للخادم فقط', () => {
  const c = rd('031_fix_create_order.sql');
  assert.match(c, /grant execute on function create_payment_order\(uuid, text, text\) to service_role/);
  assert.doesNotMatch(c, /grant execute[^;]*(anon|public|authenticated)/i);
});
