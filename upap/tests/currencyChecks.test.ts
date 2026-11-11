import test from 'node:test';
import assert from 'node:assert/strict';
import { currencyAdvisories, minorDigits } from '../lib/currencyChecks';
import { verifyInvoice } from '../lib/verify';

test('الخانات العشرية حسب العملة', () => {
  assert.equal(minorDigits('KWD'), 3); assert.equal(minorDigits('JOD'), 3);
  assert.equal(minorDigits('USD'), 2); assert.equal(minorDigits('JPY'), 0);
  assert.equal(minorDigits('ZZZ'), 2); // Intl يعامل غير المعروف كعملة عادية
});
test('اختلاف العملة وكسور زائدة', () => {
  const a = currencyAdvisories({ currency: 'USD', total: '100.2555' }, 'SYP');
  assert.deepEqual(a.map((x) => x.code), ['curDiff', 'decimals']);
  assert.deepEqual(currencyAdvisories({ currency: 'KWD', total: '12.500' }, 'KWD'), []);
  assert.equal(currencyAdvisories({ currency: 'JPY', total: '100.5' }, 'JPY')[0].code, 'decimals');
});
test('ملتبس أو عملة غير ISO لا يُحكم عليهما', () => {
  assert.deepEqual(currencyAdvisories({ currency: '$', total: '1.5' }, 'USD'), []);
  assert.deepEqual(currencyAdvisories({ currency: 'USD', total: '1,234' }, 'USD'), []);
});
test('الاستحقاق قبل الفاتورة بتقويم الملف', () => {
  assert.ok(verifyInvoice({ invoice_date: '1448-05-12', due_date: '1448-04-01' }).some((i) => i.code === 'due'));
  assert.ok(!verifyInvoice({ invoice_date: '2026-03-01', due_date: '2026-03-30' }).some((i) => i.code === 'due'));
});
