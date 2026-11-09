// قراءة لغة الواجهة من الكوكي في صفحات الخادم
import { cookies } from 'next/headers';
import { DEFAULT_LANG, LANG_COOKIE, isLang, type Lang } from './index';

export function getLang(): Lang {
  const v = cookies().get(LANG_COOKIE)?.value;
  return isLang(v) ? v : DEFAULT_LANG;
}
