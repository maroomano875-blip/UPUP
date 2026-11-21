import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// فحص ثابت لملف الترحيل 025: إدارة المكاتب عبر دوال آمنة فقط
const sql = readFileSync(join(__dirname, '..', 'supabase', 'migrations', '025_office_management.sql'), 'utf8');
const code = sql.split('\n').filter((l) => !l.trim().startsWith('--')).join('\n');

test('025: لا حذف جداول ولا تفريغ', () => {
  assert.doesNotMatch(code, /\bdrop\b/i);
  assert.doesNotMatch(code, /\btruncate\b/i);
});

test('025: الحذف الوحيد هو إزالة عضو من office_members داخل دالتين', () => {
  const dels = code.match(/delete\s+from\s+\w+/gi) ?? [];
  assert.equal(dels.length, 2);
  for (const d of dels) assert.match(d, /office_members/i);
});

test('025: RLS مفعّل على الجدولين الجديدين ولا سياسة كتابة', () => {
  assert.match(code, /alter table office_invites enable row level security/i);
  assert.match(code, /alter table office_audit enable row level security/i);
  assert.doesNotMatch(code, /create policy[^;]*for (insert|update|delete|all)/i);
});

test('025: كل الدوال security definer مع search_path ثابت', () => {
  const fns = code.match(/create or replace function/gi) ?? [];
  const defs = code.match(/security definer set search_path = public/gi) ?? [];
  assert.equal(fns.length, 5);
  assert.equal(defs.length, 5);
});

test('025: الصلاحيات للمسجَّلين فقط', () => {
  assert.equal((code.match(/revoke all on function/gi) ?? []).length, 5);
  assert.equal((code.match(/grant execute on function[^;]*to authenticated/gi) ?? []).length, 5);
  assert.doesNotMatch(code, /grant execute[^;]*to (anon|public)/i);
});

test('025: الرمز يُخزَّن مُجزَّأً وبصلاحية 48 ساعة واستعمال واحد', () => {
  assert.match(code, /code_hash text not null unique/i);
  assert.match(code, /sha256\(/i);
  assert.match(code, /interval '48 hours'/i);
  assert.match(code, /used_at is not null or inv\.expires_at <= now\(\)/i);
});

test('025: كل دالة تعديل تكتب في سجل التدقيق', () => {
  assert.ok((code.match(/insert into office_audit/gi) ?? []).length >= 5);
});

test('025: المشرف لا يدعو إلا عضواً ولا يزيل إلا عضواً، والمالك لا يُزال', () => {
  assert.match(code, /caller = 'supervisor' and p_role <> 'member'/i);
  assert.match(code, /caller = 'supervisor' and target <> 'member'/i);
  assert.match(code, /cannot_remove_owner/);
  assert.match(code, /owner_cannot_leave/);
});
