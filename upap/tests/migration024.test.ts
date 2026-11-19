import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// فحص ثابت لملف الترحيل 024: مستخدم واحد = مكتب واحد، إضافة فقط
const sql = readFileSync(join(__dirname, '..', 'supabase', 'migrations', '024_one_office_per_user.sql'), 'utf8');
const code = sql.split('\n').filter((l) => !l.trim().startsWith('--')).join('\n');

test('024: فهرس فريد على user_id يمنع الانتماء لأكثر من مكتب', () => {
  assert.match(code, /create unique index if not exists \w+\s+on office_members\(user_id\)/i);
});

test('024: لا أوامر حذف ولا تفريغ', () => {
  assert.doesNotMatch(code, /\bdrop\b/i);
  assert.doesNotMatch(code, /\bdelete\s+from\b/i);
  assert.doesNotMatch(code, /\btruncate\b/i);
});
