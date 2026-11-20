'use client';
// شارة صغيرة أعلى الصفحة: رابط الدخول إن لم يسجّل، وإلا البريد وزر الخروج
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from './I18nProvider';
import { getBrowserSupabase } from '../../lib/supabaseBrowser';

export default function AuthBadge() {
  const { t } = useI18n();
  const pathname = usePathname();
  const sb = getBrowserSupabase();
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!sb) return;
    sb.auth.getSession().then(({ data }) => { setEmail(data.session?.user.email ?? null); setReady(true); });
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => { setEmail(session?.user.email ?? null); setReady(true); });
    return () => sub.subscription.unsubscribe();
  }, [sb]);

  // لا نعرض شيئاً قبل معرفة الحالة (لا وميض) ولا داخل صفحة الدخول نفسها
  if (!sb || !ready || pathname === '/login') return null;

  return (
    <div className="fixed top-3 end-3 z-50 flex max-w-[70vw] items-center gap-2 rounded-full border border-[rgba(255,255,255,0.2)] bg-[rgba(2,6,23,0.92)] px-3 py-1.5 text-xs shadow-lg">
      {email ? (
        <>
          <span className="truncate text-[#cbd5e1]" dir="ltr">{email}</span>
          <button onClick={() => sb.auth.signOut()} className="shrink-0 font-semibold text-[#e0b45a]">{t('auth.signout')}</button>
        </>
      ) : (
        <Link href="/login" className="font-semibold text-[#e0b45a]">{t('auth.signin')}</Link>
      )}
    </div>
  );
}
