import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { canInvite, canInviteRole, canRemove, formatInviteCode, officeErrorKey } from '../lib/officePolicy';
import { DICTS } from '../lib/i18n';

test('officeErrorKey: يطابق رموز الأخطاء ويعود للعام', () => {
  assert.equal(officeErrorKey('already_in_office'), 'office.err.already_in_office');
  assert.equal(officeErrorKey('P0001: invalid_code'), 'office.err.invalid_code');
  assert.equal(officeErrorKey('boom'), 'office.err.generic');
  assert.equal(officeErrorKey(undefined), 'office.err.generic');
});

test('كل مفاتيح الأخطاء لها ترجمة بالثلاث لغات', () => {
  for (const k of ['auth_required','invalid_name','already_in_office','invalid_code','invalid_role','not_in_office','forbidden','not_found','cannot_remove_owner','owner_cannot_leave','too_many_pending_invites','generic']) {
    for (const l of ['ar', 'en', 'fr'] as const) assert.ok((DICTS[l] as Record<string, string>)[`office.err.${k}`], `${l}:${k}`);
  }
});

test('formatInviteCode: يُنسّق 16 خانة ويرفض غيرها', () => {
  assert.equal(formatInviteCode('ab12 cd34-ef56 gh78'), 'AB12-CD34-EF56-GH78');
  assert.equal(formatInviteCode('AB12CD34EF56GH78'), 'AB12-CD34-EF56-GH78');
  assert.equal(formatInviteCode('AB12-CD34'), null);
  assert.equal(formatInviteCode(''), null);
});

test('صلاحيات العرض تطابق قواعد قاعدة البيانات', () => {
  assert.equal(canInvite('member'), false);
  assert.equal(canInvite('supervisor'), true);
  assert.equal(canInviteRole('supervisor', 'supervisor'), false);
  assert.equal(canInviteRole('supervisor', 'member'), true);
  assert.equal(canInviteRole('owner', 'supervisor'), true);
  assert.equal(canRemove('owner', 'owner'), false);
  assert.equal(canRemove('supervisor', 'supervisor'), false);
  assert.equal(canRemove('supervisor', 'member'), true);
  assert.equal(canRemove('member', 'member'), false);
});

const sql = readFileSync(join(__dirname, '..', 'supabase', 'migrations', '026_list_office_members.sql'), 'utf8');
const code = sql.split('\n').filter((l) => !l.trim().startsWith('--')).join('\n');

test('026: دالة قراءة فقط للمالك والمشرف، للمسجَّلين فقط، بلا حذف', () => {
  assert.match(code, /security definer set search_path = public/i);
  assert.match(code, /not in \('owner','supervisor'\)/i);
  assert.match(code, /grant execute on function list_office_members\(uuid\) to authenticated/i);
  assert.doesNotMatch(code, /grant execute[^;]*to (anon|public)/i);
  assert.doesNotMatch(code, /\b(drop|delete|truncate|insert|update)\b/i);
});

// حماية المستخدمين الأفراد: مسار التحليل لا يعتمد على المكاتب إطلاقاً
test('المستخدم الفردي: بوابة التحليل وواجهته لا تذكر المكاتب', () => {
  for (const f of ['middleware.ts', 'lib/authGate.ts', 'ui/components/ProfessionHub.tsx']) {
    const src = readFileSync(join(__dirname, '..', f), 'utf8');
    assert.doesNotMatch(src, /office/i, f);
  }
});

test('025/026: لا تلمس جداول المستخدمين الحاليين (إضافة جداول ودوال فقط)', () => {
  for (const f of ['025_office_management.sql', '026_list_office_members.sql']) {
    const s = readFileSync(join(__dirname, '..', 'supabase', 'migrations', f), 'utf8')
      .split('\n').filter((l) => !l.trim().startsWith('--')).join('\n');
    assert.doesNotMatch(s, /alter table (auth\.|users|profiles)/i, f);
    assert.doesNotMatch(s, /update\s+auth\./i, f);
  }
});
