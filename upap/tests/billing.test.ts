import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findMatchingTransfer, fetchIncoming, isTronAddress, toMicro, USDT_TRC20 } from '../lib/tron';
import { orderErrorCode } from '../lib/billing';

const W = 'TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf';
const tx = (over: Record<string, unknown> = {}) => ({ transaction_id: 'a'.repeat(64), value: '29347000', block_timestamp: 1_000_000, to: W, token_info: { decimals: 6, address: USDT_TRC20 }, ...over });
const q = { wallet: W, amount: 29.347, fromMs: 900_000, toMs: 2_000_000 };

test('toMicro: بلا أخطاء كسور', () => {
  assert.equal(toMicro(29.347), 29347000);
  assert.equal(toMicro('29.347000'), 29347000);
  assert.equal(toMicro(0.1 + 0.2), 300000);
});

test('findMatchingTransfer: يطابق المبلغ والمحفظة والنافذة', () => {
  assert.ok(findMatchingTransfer([tx()], q));
  assert.equal(findMatchingTransfer([tx({ value: '29346000' })], q), null);
  assert.equal(findMatchingTransfer([tx({ to: 'TOther' })], q), null);
  assert.equal(findMatchingTransfer([tx({ block_timestamp: 800_000 })], q), null);
  assert.equal(findMatchingTransfer([tx({ block_timestamp: 2_500_000 })], q), null);
  assert.equal(findMatchingTransfer([tx({ token_info: { decimals: 6, address: 'TFake' } })], q), null);
});

test('fetchIncoming: يفشل عند عطل الشبكة ويقرأ القائمة', async () => {
  await assert.rejects(fetchIncoming(W, undefined, async () => ({ ok: false, json: async () => ({}) })));
  const r = await fetchIncoming(W, 'k', async (u, i) => { assert.match(u, /only_confirmed=true/); assert.equal(i.headers['TRON-PRO-API-KEY'], 'k'); return { ok: true, json: async () => ({ data: [tx()] }) }; });
  assert.equal(r.length, 1);
});

test('isTronAddress وorderErrorCode', () => {
  assert.equal(isTronAddress(W), true);
  assert.equal(isTronAddress('0x123'), false);
  assert.equal(orderErrorCode('P0001: office_owner_required'), 'office_owner_required');
  assert.equal(orderErrorCode('boom'), 'generic');
});
