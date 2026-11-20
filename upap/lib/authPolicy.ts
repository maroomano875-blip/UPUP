// سياسة الحسابات: منطق صرف قابل للاختبار (بلا اتصال بأي خدمة)
// ملاحظة أمنية: فحص النطاق هنا لتحسين التجربة فقط. التطبيق الفعلي للقاعدة يكون في الخادم
// عند منح التجربة المجانية (المرحلة 4): حساب بنطاق غير معروف أو بريد غير مؤكَّد لا يأخذ تجربة.

export const ALLOWED_EMAIL_DOMAINS = [
  'gmail.com', 'googlemail.com',
  'outlook.com', 'hotmail.com', 'live.com',
  'yahoo.com', 'icloud.com',
] as const;

export const MIN_PASSWORD_LENGTH = 8;

export const normalizeEmail = (raw: string): string => raw.trim().toLowerCase();

export function isValidEmailShape(email: string): boolean {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isAllowedEmailDomain(raw: string): boolean {
  const email = normalizeEmail(raw);
  if (!isValidEmailShape(email)) return false;
  const domain = email.split('@')[1];
  return (ALLOWED_EMAIL_DOMAINS as readonly string[]).includes(domain);
}

// null = كلمة المرور مقبولة، وإلا رمز المشكلة
export type PasswordIssue = 'short' | 'needs_letter_and_digit';
export function passwordIssue(pw: string): PasswordIssue | null {
  if (pw.length < MIN_PASSWORD_LENGTH) return 'short';
  if (!/[A-Za-z؀-ۿ]/.test(pw) || !/\d/.test(pw)) return 'needs_letter_and_digit';
  return null;
}

// تحويل رسائل Supabase الإنجليزية إلى مفاتيح ترجمة (لا نعرض نص الخادم الخام للمستخدم)
export type AuthErrKey =
  | 'auth.err.invalid' | 'auth.err.unconfirmed' | 'auth.err.exists'
  | 'auth.err.rate' | 'auth.err.generic';
export function authErrorKey(message: string | undefined | null): AuthErrKey {
  const m = (message ?? '').toLowerCase();
  if (m.includes('invalid login credentials')) return 'auth.err.invalid';
  if (m.includes('email not confirmed')) return 'auth.err.unconfirmed';
  if (m.includes('already registered') || m.includes('already been registered')) return 'auth.err.exists';
  if (m.includes('rate limit') || m.includes('too many') || m.includes('security purposes')) return 'auth.err.rate';
  return 'auth.err.generic';
}
