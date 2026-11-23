import { test } from 'node:test';
import assert from 'node:assert/strict';
import { receiptMail, safeLang } from '../lib/receiptEmail';
import { sendMail } from '../lib/mailer';

test('receipt mail has plan, period and date in each language', () => {
  const m = receiptMail('a@b.co', 'en', 'small', 'weekly', '2026-12-28T10:00:00Z');
  assert.equal(m.to, 'a@b.co');
  assert.match(m.text, /Small office/);
  assert.match(m.text, /2026-12-28/);
  assert.match(receiptMail('a@b.co', 'ar', 'medium', 'monthly', '2026-12-28T10:00:00Z').text, /المتوسطة/);
  assert.equal(safeLang('xx'), 'ar');
});

test('mailer reports not_configured without keys', async () => {
  const keep = { ...process.env };
  for (const k of ['BREVO_API_KEY', 'MAIL_FROM', 'GMAIL_USER', 'GMAIL_APP_PASSWORD']) delete process.env[k];
  assert.equal(await sendMail({ to: 'a@b.co', subject: 's', text: 't', html: 'h' }), 'not_configured');
  Object.assign(process.env, keep);
});

test('mailer uses Brevo when its key exists', async () => {
  process.env.BREVO_API_KEY = 'k'; process.env.MAIL_FROM = 'from@x.co';
  let url = ''; let key = '';
  const f = (async (u: string, init: { headers: Record<string, string> }) => { url = u; key = init.headers['api-key']; return { ok: true }; }) as unknown as typeof fetch;
  assert.equal(await sendMail({ to: 'a@b.co', subject: 's', text: 't', html: 'h' }, f), 'sent');
  assert.match(url, /brevo/); assert.equal(key, 'k');
  delete process.env.BREVO_API_KEY; delete process.env.MAIL_FROM;
});
