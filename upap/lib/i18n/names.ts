// أسماء الدول من مكتبة Intl المدمجة (تدعم أي لغة بلا ترجمة يدوية)، وأسماء المهن من الفهرس
import type { Lang } from './index';

export function countryName(code: string, lang: Lang, fallbackAr: string): string {
  if (lang === 'ar') return fallbackAr;
  try { return new Intl.DisplayNames([lang], { type: 'region' }).of(code) ?? fallbackAr; } catch { return fallbackAr; }
}
export { profName } from './catalog';
