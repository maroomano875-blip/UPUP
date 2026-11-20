import test from 'node:test';
import assert from 'node:assert/strict';
import { authErrorKey, isAllowedEmailDomain, normalizeEmail, passwordIssue } from '../lib/authPolicy';

test('النطاقات المقبولة فقط للتسجيل بالإيميل', () => {
  for (const e of ['a@gmail.com', 'A@Gmail.COM ', 'x@outlook.com', 'x@hotmail.com', 'x@yahoo.com', 'x@icloud.com']) {
    assert.equal(isAllowedEmailDomain(e), true, e);
  }
  for (const e of ['a@mailinator.com', 'a@gmail.com.evil.io', 'a@evilgmail.com', 'not-an-email', '', '@gmail.com', 'a b@gmail.com']) {
    assert.equal(isAllowedEmailDomain(e), false, e);
  }
});

test('تطبيع الإيميل: مسافات وحروف كبيرة', () => {
  assert.equal(normalizeEmail('  Foo@Gmail.Com '), 'foo@gmail.com');
});

test('قوة كلمة المرور', () => {
  assert.equal(passwordIssue('abc123'), 'short');
  assert.equal(passwordIssue('abcdefgh'), 'needs_letter_and_digit');
  assert.equal(passwordIssue('12345678'), 'needs_letter_and_digit');
  assert.equal(passwordIssue('abcd1234'), null);
  assert.equal(passwordIssue('كلمةسر12'), null);
});

test('رسائل Supabase تتحول لمفاتيح ترجمة ولا يظهر نص الخادم', () => {
  assert.equal(authErrorKey('Invalid login credentials'), 'auth.err.invalid');
  assert.equal(authErrorKey('Email not confirmed'), 'auth.err.unconfirmed');
  assert.equal(authErrorKey('User already registered'), 'auth.err.exists');
  assert.equal(authErrorKey('email rate limit exceeded'), 'auth.err.rate');
  assert.equal(authErrorKey('something weird'), 'auth.err.generic');
  assert.equal(authErrorKey(undefined), 'auth.err.generic');
});
