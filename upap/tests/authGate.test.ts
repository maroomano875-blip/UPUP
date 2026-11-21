import test from 'node:test';
import assert from 'node:assert/strict';
import { extractBearer, verifyAccessToken } from '../lib/authGate';

const TOKEN = 'a'.repeat(30) + '.' + 'b'.repeat(30);

test('استخراج الرمز من الترويسة', () => {
  assert.equal(extractBearer(`Bearer ${TOKEN}`), TOKEN);
  assert.equal(extractBearer(`bearer ${TOKEN}`), null);
  assert.equal(extractBearer('Bearer short'), null);
  assert.equal(extractBearer(''), null);
  assert.equal(extractBearer(null), null);
  assert.equal(extractBearer(`Bearer ${TOKEN} extra`), null);
});

test('رمز صالح يرجع معرّف المستخدم', async () => {
  let seen = '';
  const id = await verifyAccessToken('https://x.supabase.co/', 'anon', TOKEN, async (url, init) => {
    seen = url + '|' + init.headers.Authorization;
    return { ok: true, json: async () => ({ id: '11111111-2222-3333-4444-555555555555' }) };
  });
  assert.equal(id, '11111111-2222-3333-4444-555555555555');
  assert.equal(seen, `https://x.supabase.co/auth/v1/user|Bearer ${TOKEN}`);
});

test('رمز مرفوض أو رد غريب أو عطل شبكة = رفض (فشل مغلق)', async () => {
  assert.equal(await verifyAccessToken('https://x', 'k', TOKEN, async () => ({ ok: false, json: async () => ({}) })), null);
  assert.equal(await verifyAccessToken('https://x', 'k', TOKEN, async () => ({ ok: true, json: async () => ({}) })), null);
  assert.equal(await verifyAccessToken('https://x', 'k', TOKEN, async () => ({ ok: true, json: async () => ({ id: 5 }) })), null);
  assert.equal(await verifyAccessToken('https://x', 'k', TOKEN, async () => { throw new Error('net'); }), null);
});
