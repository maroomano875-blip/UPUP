'use client';
// سياق اللغة لمكوّنات العميل
import { createContext, useContext } from 'react';
import { t, type Key, type Lang } from '../../lib/i18n';

const Ctx = createContext<Lang>('ar');
export function I18nProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <Ctx.Provider value={lang}>{children}</Ctx.Provider>;
}
export function useI18n() {
  const lang = useContext(Ctx);
  return { lang, t: (k: Key, v?: Record<string, string | number>) => t(lang, k, v) };
}
