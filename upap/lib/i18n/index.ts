// نظام الترجمة: لإضافة لغة جديدة أنشئ ملف قاموس بنفس المفاتيح وسجّله هنا فقط.
import { ar } from './ar';
import type { Dict } from './ar';
import { en } from './en';
import { fr } from './fr';

export type Lang = 'ar' | 'en' | 'fr';
export const LANG_LIST: { code: Lang; native: string; dir: 'rtl' | 'ltr' }[] = [
  { code: 'ar', native: 'العربية', dir: 'rtl' },
  { code: 'en', native: 'English', dir: 'ltr' },
  { code: 'fr', native: 'Français', dir: 'ltr' },
];
export const DEFAULT_LANG: Lang = 'ar';
export const LANG_COOKIE = 'upap_lang';
export const DICTS: Record<Lang, Dict> = { ar, en, fr };
export type Key = keyof Dict;

export const isLang = (v: unknown): v is Lang => LANG_LIST.some((l) => l.code === v);
export const dirOf = (lang: Lang) => LANG_LIST.find((l) => l.code === lang)!.dir;

// ترجمة مفتاح مع استبدال {name} بالقيم
export function t(lang: Lang, key: Key, vars?: Record<string, string | number>): string {
  let s = DICTS[lang][key] ?? DICTS[DEFAULT_LANG][key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
  return s;
}
