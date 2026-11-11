import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRates, convert, sypBoth, fetchRates } from '../lib/currency';

const R = parseRates({ date: '2026-11-10', usd: { eur: 0.5, syp: 110, jod: 0.7 } }, 'test')!;
test('بنية سليمة فقط', () => {
  assert.equal(parseRates({ usd: { eur: 1 } }, 's'), null);
  assert.equal(parseRates({ date: '2026-11-10' }, 's'), null);
  assert.equal(parseRates(null, 's'), null);
  assert.equal(R.date, '2026-11-10');
});
test('التحويل عبر الدولار وغياب العملة', () => {
  assert.equal(convert(100, 'USD', 'EUR', R), 50);
  assert.equal(convert(50, 'EUR', 'USD', R), 100);
  assert.equal(convert(1, 'USD', 'XXX', R), null);
});
test('الليرة السورية: قديمة وجديدة بنسبة 100', () => {
  assert.deepEqual(sypBoth(11000, 110), { old: 1100000, neu: 11000 });
  assert.deepEqual(sypBoth(1100000, 11000), { old: 1100000, neu: 11000 });
});
test('فشل الجلب يعيد null ولا يرمي', async () => {
  const bad = (async () => { throw new Error('x'); }) as unknown as typeof fetch;
  assert.equal(await fetchRates(bad), null);
  const second = (async (u: string) => (String(u).includes('pages.dev') ? { ok: true, json: async () => ({ date: '2026-11-10', usd: { eur: 2 } }) } : { ok: false })) as unknown as typeof fetch;
  assert.equal((await fetchRates(second))?.usd.eur, 2);
});
