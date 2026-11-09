'use client';
// مبدّل لغة الواجهة: يكتب الكوكي ويعيد رسم الصفحة
import { useRouter } from 'next/navigation';
import { LANG_COOKIE, LANG_LIST, type Lang } from '../../lib/i18n';
import { useI18n } from './I18nProvider';

export default function UiLangSwitch() {
  const { lang, t } = useI18n();
  const router = useRouter();
  function pick(l: Lang) {
    document.cookie = `${LANG_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }
  return (
    <div className="fixed bottom-4 end-4 z-50 flex gap-1 rounded-full border border-[rgba(255,255,255,0.2)] bg-[rgba(2,6,23,0.92)] p-1 text-xs shadow-lg" role="group" aria-label={t('lang.label')}>
      {LANG_LIST.map((l) => (
        <button key={l.code} onClick={() => pick(l.code)} aria-pressed={lang === l.code}
          className={`rounded-full px-3 py-1.5 font-semibold ${lang === l.code ? 'bg-[#e0b45a] text-[#020617]' : 'text-[#cbd5e1]'}`}>{l.native}</button>
      ))}
    </div>
  );
}
