import test from 'node:test';
import assert from 'node:assert/strict';
import { judgeDates, hijriToGregorian, isoOf, parseIso } from '../lib/dates';
import { verifyDates } from '../lib/verify';

test('تواريخ ميلادية: تاريخ غير موجود يُرفض بدل أن يتدحرج', () => {
  const v = judgeDates('2026-02-30', '2026-03-05');
  assert.ok(v.issues.includes('invalid'));
  assert.equal(v.bad, false);
});
test('هجريان: مقارنة هجرية مباشرة بلا تحويل', () => {
  const v = judgeDates('1448-05-12', '1448-04-01');
  assert.equal(v.cal, 'hijri'); assert.equal(v.bad, true); assert.equal(v.gStart, undefined);
  assert.equal(judgeDates('1447-12-29', '1448-01-01').bad, false);
});
test('تحويل هجري→ميلادي معروف: 1 محرم 1448', () => {
  const ms = hijriToGregorian({ y: 1448, m: 1, d: 1 })!;
  assert.ok(['2026-06-16', '2026-06-17'].includes(isoOf(ms)));
});
test('مختلط: يُحوَّل ويُقارَن مع هامش يوم', () => {
  const v = judgeDates('1448-01-01', '2026-07-01');
  assert.equal(v.cal, 'mixed'); assert.equal(v.bad, false); assert.ok(v.gStart);
  assert.equal(judgeDates('1448-01-01', '2026-05-01').bad, true);
});
test('الاقتباس: عدم تطابق وغموض يوم/شهر', () => {
  assert.ok(judgeDates('2026-03-04', '2026-03-10', 'من 05/06/2026 إلى 10/03/2026').issues.includes('quoteMismatch'));
  assert.ok(judgeDates('2026-04-03', '2026-05-01', 'from 03/04/2026 to 01/05/2026').issues.includes('ambiguous'));
  assert.deepEqual(judgeDates('2026-03-13', '2026-03-20', '13/03/2026 - 20/03/2026').issues, []);
});
test('أرقام هندية وصيغ غير ISO', () => {
  assert.deepEqual(parseIso('٢٠٢٦-٠٣-٠١'), { y: 2026, m: 3, d: 1 });
  assert.equal(parseIso('1 March 2026'), null);
  assert.equal(verifyDates([{ start: 'March 10, 2026', end: 'March 1, 2026' }])[0].bad, true);
});
