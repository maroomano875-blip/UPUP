import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(__dirname, '..');
const langs = ['ar', 'en', 'fr'];

test('legal i18n keys exist in all languages', () => {
  for (const l of langs) {
    const src = readFileSync(join(root, 'lib/i18n', `${l}.ts`), 'utf8');
    for (const k of ['legal.terms', 'legal.privacy', 'legal.refunds', 'legal.agree', 'legal.contactSoon']) {
      assert.ok(src.includes(`"${k}"`), `${l} missing ${k}`);
    }
  }
});

test('legal pages exist and use LegalPage', () => {
  for (const [dir, kind] of [['privacy', 'privacy'], ['terms', 'terms'], ['refunds', 'refunds']]) {
    const src = readFileSync(join(root, 'app', dir, 'page.tsx'), 'utf8');
    assert.ok(src.includes(`kind="${kind}"`));
  }
});

test('forgot-password i18n keys exist in all languages', () => {
  for (const l of langs) {
    const src = readFileSync(join(root, 'lib/i18n', `${l}.ts`), 'utf8');
    for (const k of ['auth.forgot', 'auth.ok.reset', 'auth.err.needEmail', 'reset.title', 'reset.new', 'reset.submit', 'reset.ok', 'reset.noSession', 'reset.toLogin']) {
      assert.ok(src.includes(`"${k}"`), `${l} missing ${k}`);
    }
  }
});
