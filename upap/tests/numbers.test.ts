import test from 'node:test';
import assert from 'node:assert/strict';
import { parseNum, toNum } from '../lib/numbers';
import { verifyChecks, verifyInvoice } from '../lib/verify';

test('صيغ الأرقام الشائعة تُقرأ صحيحة', () => {
  const t: [unknown, number][] = [
    ['1,234.56', 1234.56], ['1.234,56', 1234.56], ['1 234,56', 1234.56], ['1 234,56', 1234.56], ['1’234.50', 1234.5], ["1'234.50", 1234.5],
    ['12,5', 12.5], ['12.5', 12.5], ['1,23', 1.23], ['0,125', 0.125], ['0.125', 0.125],
    ['1,234,567', 1234567], ['1.234.567', 1234567], ['1,234,567.89', 1234567.89], ['1.234.567,89', 1234567.89],
    ['١٢٣٤٫٥٠', 1234.5], ['١٬٢٣٤٫٥٠', 1234.5], ['۱۲۳۴.۵', 1234.5],
    ['$1,234.50', 1234.5], ['1.234,50 €', 1234.5], ['SAR 1,850,000', 1850000], ['1 850 000 ل.س', 1850000], ['15%', 15],
    ['-1,234.50', -1234.5], ['(1,234.50)', -1234.5], ['1.234,50-', -1234.5], ['−5', -5],
    ['1e3', 1000], ['SAR -5', -5], ['USD (12.50)', -12.5], [42, 42], [' 12 ', 12],
  ];
  for (const [v, want] of t) assert.equal(toNum(v), want, `${JSON.stringify(v)}`);
});

test('قيم غير رقمية تعطي null بلا تخمين', () => {
  for (const v of [null, undefined, '', '   ', 'abc', '--', '.', NaN, {}, true, '2026-01-05', '05/11/2026', '3:30', '10-20', '1/2']) assert.equal(toNum(v), null, String(v));
});

test('الالتباس الحقيقي يُعلَن: فاصل واحد وثلاث خانات', () => {
  assert.equal(parseNum('1,234').ambiguous, true);
  assert.equal(parseNum('1.234').ambiguous, true);
  assert.equal(parseNum('1,234', 'en').n, 1234);
  assert.equal(parseNum('1,234', 'eu').n, 1.234);
  assert.equal(parseNum('1.234', 'eu').n, 1234);
  for (const v of ['12,5', '1,234.5', '1.234,5', '0,125', '1,234,567']) assert.equal(parseNum(v).ambiguous, false, v);
});

test('فحص الأرقام: الصيغة الأوروبية لا تُنتج عدم تطابق كاذباً', () => {
  const r = verifyChecks([{ label: 'الإجمالي', stated: '1.250,00', parts: ['1.000,00', '250,00'] }]);
  assert.equal(r[0].bad, false);
  assert.equal(r[0].stated, 1250);
});

test('فحص الأرقام: الأرقام العربية المشرقية تُحسب ولا تُهمَل', () => {
  const r = verifyChecks([{ label: 'x', stated: '١٢٥٠٫٠٠', parts: ['١٠٠٠', '٢٥٠'] }, { label: 'y', stated: '١٣٠٠', parts: ['١٠٠٠', '٢٥٠'] }]);
  assert.equal(r[0].bad, false);
  assert.equal(r[1].bad, true);
});

test('فحص الأرقام: الالتباس يجرّب الاتفاقيتين، والخطأ الحقيقي يبقى خطأً', () => {
  // 1.234 + 2.000 = 3.234 بالأوروبية (ألف ومئتان وأربعة وثلاثون...) ؛ لا يُعلَن عدم تطابق
  assert.equal(verifyChecks([{ label: 'a', stated: '3.234', parts: ['1.234', '2.000'] }])[0].bad, false);
  assert.equal(verifyChecks([{ label: 'b', stated: '3,234', parts: ['1,234', '2,000'] }])[0].bad, false);
  // خطأ حقيقي بأي اتفاقية
  assert.equal(verifyChecks([{ label: 'c', stated: '9.999', parts: ['1.234', '2.000'] }])[0].bad, true);
});

test('الفاتورة بالصيغة الأوروبية: سليمة بلا ملاحظات، والخطأ الحقيقي يُكشف', () => {
  const ok = { line_items: [{ quantity: '2', unit_price: '10,50', total: '21,00' }], subtotal: '21,00', tax: '4,20', total: '25,20' };
  assert.deepEqual(verifyInvoice(ok), []);
  const bad = { ...ok, total: '30,00' };
  assert.equal(verifyInvoice(bad).length, 1);
});
