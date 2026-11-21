// سياسة المكاتب (واجهة فقط): تحويل أخطاء قاعدة البيانات لمفاتيح ترجمة، وتنسيق رمز الدعوة،
// وصلاحيات العرض. التطبيق الفعلي للصلاحيات يتم في دوال Supabase (025) لا هنا.
export type OfficeRole = 'owner' | 'supervisor' | 'member';

const KNOWN_ERRORS = [
  'auth_required', 'invalid_name', 'already_in_office', 'invalid_code', 'invalid_role',
  'not_in_office', 'forbidden', 'not_found', 'cannot_remove_owner', 'owner_cannot_leave',
  'too_many_pending_invites',
] as const;

// أخطاء RPC تصل كنص يحوي الرمز؛ نطابقه ونعيد مفتاح ترجمة
export function officeErrorKey(message: string | undefined | null) {
  const m = (message ?? '').toLowerCase();
  const hit = KNOWN_ERRORS.find((k) => m.includes(k));
  return `office.err.${hit ?? 'generic'}` as const;
}

// يُبقي الحروف والأرقام فقط ويعيد الصيغة XXXX-XXXX-XXXX-XXXX (أو null إن لم يكتمل 16 خانة)
export function formatInviteCode(input: string): string | null {
  const raw = (input ?? '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  if (raw.length !== 16) return null;
  return raw.match(/.{4}/g)!.join('-');
}

export const canInvite = (role: OfficeRole) => role === 'owner' || role === 'supervisor';
export const canInviteRole = (caller: OfficeRole, target: 'supervisor' | 'member') =>
  caller === 'owner' || (caller === 'supervisor' && target === 'member');
export const canRemove = (caller: OfficeRole, target: OfficeRole) =>
  target !== 'owner' && (caller === 'owner' || (caller === 'supervisor' && target === 'member'));
