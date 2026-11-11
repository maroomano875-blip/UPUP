import test from 'node:test';
import assert from 'node:assert/strict';
import { vatAdvisory } from '../lib/vatCheck';
import { STANDARD_VAT, COUNTRIES } from '../data/countries';

test('نسبة مطابقة لا تُنبَّه، ومخالفة تُنبَّه', () => {
  assert.equal(vatAdvisory({ currency: 'SAR', subtotal: '1000', tax: '150' }, 'SA', 'SAR'), null);
  const a = vatAdvisory({ currency: 'SAR', subtotal: '1000', tax: '100' }, 'SA', 'SAR');
  assert.equal(a?.implied, 10); assert.deepEqual(a?.rates, [15]);
});
test('عملة أجنبية أو دولة بلا نسبة أو ضريبة صفر: لا فحص', () => {
  assert.equal(vatAdvisory({ currency: 'USD', subtotal: '1000', tax: '100' }, 'SA', 'SAR'), null);
  assert.equal(vatAdvisory({ currency: 'SYP', subtotal: '1000', tax: '100' }, 'SY', 'SYP'), null);
  assert.equal(vatAdvisory({ currency: 'EUR', subtotal: '1000', tax: '0' }, 'FR', 'EUR'), null);
});
test('نسبتان للدولة (إندونيسيا) وكل رموز الجدول دول موجودة', () => {
  assert.equal(vatAdvisory({ subtotal: '1000', tax: '120' }, 'ID', 'IDR'), null);
  for (const c of Object.keys(STANDARD_VAT)) assert.ok(COUNTRIES.some((x) => x.code === c), c);
});

test('النسب المسجَّلة تطابق نص حقل tax لكل دولة (لا تناقض داخل البيانات)', () => {
  for (const [code, rates] of Object.entries(STANDARD_VAT)) {
    const tax = COUNTRIES.find((c) => c.code === code)!.tax;
    for (const r of rates) assert.ok(tax.includes(String(r)) || tax.includes(`${rates[0]}-${rates[rates.length - 1]}`), `${code}: ${tax}`);
  }
});
