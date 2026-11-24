import test from 'node:test';
import assert from 'node:assert/strict';
import { hit, _reset } from '../lib/rateLimit';

test('rateLimit: allows up to max then blocks, then resets after window', () => {
  _reset();
  for (let i = 0; i < 3; i++) assert.equal(hit('k', 3, 1000, 0), true);
  assert.equal(hit('k', 3, 1000, 10), false);
  assert.equal(hit('other', 3, 1000, 10), true);
  assert.equal(hit('k', 3, 1000, 1001), true);
});
