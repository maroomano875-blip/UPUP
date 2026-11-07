import test from 'node:test';
import assert from 'node:assert/strict';
import { toNum, verifyChecks, verifyDates } from '../lib/verify';

test('toNum: فواصل الآلاف والنصوص والقيم الفارغة', () => {
  assert.equal(toNum('1,234.5'), 1234.5);
  assert.equal(toNum(' 12 '), 12);
  assert.equal(toNum(null), null);
  assert.equal(toNum(''), null);
  assert.equal(toNum('abc'), null);
});

test('الأرقام: مجموع صحيح لا يُعلَّم', () => {
  const [r] = verifyChecks([{ label: 'x', stated: 244, parts: [100, 100, 44] }]);
  assert.equal(r.bad, false);
  assert.equal(r.sum, 244);
});

test('الأرقام: 234 مقابل 244 (حالة T4) تُعلَّم', () => {
  const [r] = verifyChecks([{ label: 'x', stated: 244, parts: [100, 100, 34] }]);
  assert.equal(r.bad, true);
  assert.equal(r.sum, 234);
});

test('النسبة: أجزاء تجمع 110 مقابل 100 تُعلَّم', () => {
  const [r] = verifyChecks([{ label: 'نسب', stated: 100, parts: [50, 40, 20] }]);
  assert.equal(r.bad, true);
});

test('التسامح: فرق صغير في الكسور مقبول', () => {
  const [r] = verifyChecks([{ label: 'x', stated: 100, parts: [33.33, 33.33, 33.34] }]);
  assert.equal(r.bad, false);
});

test('التسامح: حدّ 0.5% (1004 يمر، 1006 يُعلَّم)', () => {
  assert.equal(verifyChecks([{ stated: 1000, parts: [1004] }])[0].bad, false);
  assert.equal(verifyChecks([{ stated: 1000, parts: [1006] }])[0].bad, true);
});

test('أرقام كنصوص بفواصل تُقرأ صحيحاً', () => {
  const [r] = verifyChecks([{ stated: '1,000', parts: ['400', '600'] }]);
  assert.equal(r.bad, false);
  assert.equal(r.sum, 1000);
});

test('بدون أجزاء أو بدون رقم معلن: لا حكم', () => {
  assert.equal(verifyChecks([{ stated: 10, parts: [] }])[0].bad, false);
  assert.equal(verifyChecks([{ stated: null, parts: [5] }])[0].bad, false);
  assert.equal(verifyChecks([{ stated: 10 }])[0].sum, null);
});

test('مدخلات غير مصفوفة أو عناصر فارغة لا تنهار', () => {
  assert.deepEqual(verifyChecks(undefined), []);
  assert.deepEqual(verifyChecks('x'), []);
  assert.equal(verifyChecks([null])[0].bad, false);
  assert.deepEqual(verifyDates(null), []);
});

test('التواريخ: النهاية قبل البداية تُعلَّم', () => {
  const [r] = verifyDates([{ label: 'فترة', start: '2026-03-10', end: '2026-03-01' }]);
  assert.equal(r.bad, true);
});

test('التواريخ: ترتيب سليم أو تاريخ متساوٍ لا يُعلَّم', () => {
  assert.equal(verifyDates([{ start: '2026-03-01', end: '2026-03-10' }])[0].bad, false);
  assert.equal(verifyDates([{ start: '2026-03-01', end: '2026-03-01' }])[0].bad, false);
});

test('التواريخ: قيمة ناقصة أو غير مفهومة لا تُعدّ خطأ', () => {
  assert.equal(verifyDates([{ start: null, end: '2026-03-01' }])[0].bad, false);
  assert.equal(verifyDates([{ start: 'قريباً', end: '2026-03-01' }])[0].bad, false);
});
