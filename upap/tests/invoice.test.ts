import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyInvoice } from '../lib/verify';

test('فاتورة T4: أربعة أخطاء تُكتشف بالكود', () => {
  const r = verifyInvoice({
    line_items: [{ quantity: 4, unit_price: 18.5, total: 84 }, { quantity: 2, unit_price: 50, total: 100 }, { quantity: 1, unit_price: 50, total: 50 }],
    subtotal: 244, tax: 19.52, total: 270, invoice_date: '2026-03-10', due_date: '2026-03-01',
  });
  assert.equal(r.length, 4);
});

test('فاتورة سليمة لا تعطي ملاحظات', () => {
  const r = verifyInvoice({
    line_items: [{ quantity: 2, unit_price: 10, total: 20 }, { quantity: 1, unit_price: 5, total: 5 }],
    subtotal: 25, tax: 2.5, total: 27.5, invoice_date: '2026-03-01', due_date: '2026-03-30',
  });
  assert.deepEqual(r, []);
});

test('حقول ناقصة أو أصفار افتراضية لا تعطي ملاحظات', () => {
  assert.deepEqual(verifyInvoice({}), []);
  assert.deepEqual(verifyInvoice(null), []);
  assert.deepEqual(verifyInvoice({ subtotal: 0, tax: 0, total: 0, line_items: [] }), []);
});
