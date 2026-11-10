import test from 'node:test';
import assert from 'node:assert/strict';
import { DICTS, LANG_LIST, t } from '../lib/i18n';
import { invoiceIssueText } from '../lib/i18n/format';
import { verifyInvoice } from '../lib/verify';

const vars = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join(',');

test('كل لغة تملك كل المفاتيح وبنفس المتغيّرات {…}', () => {
  const base = DICTS.ar;
  for (const { code } of LANG_LIST) {
    for (const k of Object.keys(base) as (keyof typeof base)[]) {
      const v = DICTS[code][k];
      assert.ok(v && v.trim(), `ناقص ${code}:${k}`);
      assert.equal(vars(v), vars(base[k]), `متغيّرات مختلفة ${code}:${k}`);
    }
  }
});

test('الترجمة الإنجليزية والفرنسية ليست نسخة من العربية', () => {
  for (const code of ['en', 'fr'] as const) {
    const same = (Object.keys(DICTS.ar) as (keyof typeof DICTS.ar)[]).filter((k) => /[؀-ۿ]/.test(DICTS[code][k]));
    assert.deepEqual(same, [], `نص عربي داخل ${code}`);
  }
});

test('رسائل فحص الفاتورة تُصاغ بكل لغة بلا متغيّرات متروكة', () => {
  const issues = verifyInvoice({ line_items: [{ quantity: 4, unit_price: 18.5, total: 84 }], subtotal: 244, tax: 19.5, total: 270, invoice_date: '2026-03-10', due_date: '2026-03-01' });
  assert.ok(issues.length >= 3);
  for (const { code } of LANG_LIST) for (const i of issues) assert.ok(!/\{\w+\}/.test(invoiceIssueText(i, code)));
});

test('t() يستبدل المتغيّرات', () => {
  assert.equal(t('en', 'home.card.profSub', { n: 7 }), '7 live now');
});
