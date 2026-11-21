// يحوّل رمز رفض الحصة القادم من الخادم إلى مفتاح ترجمة (أو null إن لم يكن رفض حصة)
const MAP = {
  trial_ended: 'quota.trial_ended',
  trial_daily_used: 'quota.trial_daily_used',
  trial_already_used: 'quota.trial_already_used',
  email_domain: 'quota.email_domain',
  quota_unavailable: 'quota.quota_unavailable',
} as const;
export function quotaMessageKey(code: string | undefined | null): (typeof MAP)[keyof typeof MAP] | null {
  return code && Object.prototype.hasOwnProperty.call(MAP, code) ? MAP[code as keyof typeof MAP] : null;
}
