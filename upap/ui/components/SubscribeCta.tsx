'use client';
// زر الاشتراكات في الصفحة الرئيسية (للمسجَّلين فقط)
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useI18n } from './I18nProvider';
import { getBrowserSupabase } from '../../lib/supabaseBrowser';

export default function SubscribeCta() {
  const { t } = useI18n();
  const [logged, setLogged] = useState(false);
  useEffect(() => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    sb.auth.getSession().then(({ data }) => setLogged(!!data.session));
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => setLogged(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);
  if (!logged) return null;
  return (
    <Link href="/subscribe" className="fx-press fx-rise block rounded-xl bg-[#e0b45a] py-3 text-center text-base font-bold text-[#0f172a] shadow-lg">{t('plans.title')}</Link>
  );
}
