import test from 'node:test';
import assert from 'node:assert/strict';
import { countryDateContext } from '../lib/countryContext';

const t = new Date('2026-11-08T22:30:00Z');

test('أمريكا: شهر/يوم/سنة', () => {
  assert.match(countryDateContext('US', t), /month\/day\/year/);
});
test('سوريا والسعودية وبريطانيا: يوم/شهر/سنة', () => {
  for (const c of ['SY', 'SA', 'GB']) assert.match(countryDateContext(c, t), /day\/month\/year/);
});
test('تاريخ اليوم بتوقيت كل دولة', () => {
  assert.match(countryDateContext('SY', t), /2026-11-09/);
  assert.match(countryDateContext('US', t), /2026-11-08/);
});
