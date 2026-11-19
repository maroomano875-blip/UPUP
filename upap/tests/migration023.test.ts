import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// فحص ثابت لملف الترحيل 023: إضافة فقط، بلا حذف، وRLS على كل جدول جديد
const sql = readFileSync(join(__dirname, '..', 'supabase', 'migrations', '023_accounts_offices_subscriptions.sql'), 'utf8');
const code = sql.split('\n').filter((l) => !l.trim().startsWith('--')).join('\n');

test('023: لا أوامر حذف ولا تفريغ ولا تعديل مدمّر', () => {
  assert.doesNotMatch(code, /\bdrop\b/i);
  assert.doesNotMatch(code, /\bdelete\s+from\b/i);
  assert.doesNotMatch(code, /\btruncate\b/i);
  assert.doesNotMatch(code, /alter\s+table[^;]*\bdrop\b/i);
});

test('023: كل الجداول الجديدة if not exists وعليها RLS', () => {
  const tables = [...code.matchAll(/create table if not exists (\w+)/gi)].map((m) => m[1]);
  assert.ok(tables.length >= 8);
  assert.equal([...code.matchAll(/create table (?!if not exists)/gi)].length, 0);
  for (const t of tables) {
    assert.match(code, new RegExp(`alter table ${t} enable row level security`, 'i'), `RLS مفقود على ${t}`);
  }
});

test('023: لا سياسات كتابة للعميل، والخطط الثلاث مزروعة بالأسقف المعتمدة', () => {
  assert.doesNotMatch(code, /for (insert|update|delete|all)\b/i);
  assert.match(code, /'small',\s*'Small',\s*3,\s*80/);
  assert.match(code, /'medium',\s*'Medium',\s*8,\s*200/);
  assert.match(code, /'large',\s*'Large',\s*20,\s*400/);
});

test('023: المبلغ الفريد والعملية الفريدة مضمونان بفهرس', () => {
  assert.match(code, /unique index if not exists uq_payment_orders_pending_amount/i);
  assert.match(code, /unique index if not exists uq_payment_orders_tx/i);
});
