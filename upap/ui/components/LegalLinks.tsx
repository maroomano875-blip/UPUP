'use client';
// روابط الصفحات القانونية (تذييل صغير) تُستعمل في الصفحات التي تُجمع فيها بيانات أو يتم الدفع.
import Link from 'next/link';
import { useI18n } from './I18nProvider';

export default function LegalLinks({ agree = false }: { agree?: boolean }) {
  const { t } = useI18n();
  return (
    <div className="space-y-1 text-center text-xs text-[#94a3b8]">
      {agree && <p>{t('legal.agree')}</p>}
      <p className="flex flex-wrap justify-center gap-x-4 gap-y-1">
        <Link href="/terms" className="text-[#a5b4fc] underline">{t('legal.terms')}</Link>
        <Link href="/privacy" className="text-[#a5b4fc] underline">{t('legal.privacy')}</Link>
        <Link href="/refunds" className="text-[#a5b4fc] underline">{t('legal.refunds')}</Link>
      </p>
    </div>
  );
}
