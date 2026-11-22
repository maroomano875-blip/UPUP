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
  const [tip, setTip] = useState(false);
  // البريد يظهر كاملاً لحظة الدخول ثم ينطوي ببطء إلى أول حرف فقط؛ النقر عليه يفتحه ثم يطويه ثانية
  const [open, setOpen] = useState(true);
  useEffect(() => {
    if (!email || !open) return;
    const id = window.setTimeout(() => setOpen(false), open ? 2800 : 0);
    return () => window.clearTimeout(id);
  }, [email, open]);

  // تنويه يظهر مرة واحدة لكل متصفح بعد الدخول: «مكتبي» موجودة بالداخل
  useEffect(() => {
    if (!email) { setTip(false); return; }
    try { if (window.localStorage.getItem('upap_office_tip') !== '1') setTip(true); } catch { /* التخزين غير متاح */ }
  }, [email]);
  const closeTip = () => { setTip(false); try { window.localStorage.setItem('upap_office_tip', '1'); } catch { /* تجاهل */ } };

  useEffect(() => {
    if (!sb) return;
    sb.auth.getSession().then(({ data }) => { setEmail(data.session?.user.email ?? null); setReady(true); });
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => { setEmail(session?.user.email ?? null); setReady(true); });
    return () => sub.subscription.unsubscribe();
  }, [sb]);

  // لا نعرض شيئاً قبل معرفة الحالة (لا وميض) ولا داخل صفحة الدخول نفسها
  if (!sb || !ready || pathname === '/login') return null;

  return (
    <>
    <div className="fixed top-3 end-3 z-50 flex max-w-[70vw] items-center gap-2 rounded-full border border-[rgba(255,255,255,0.2)] bg-[rgba(2,6,23,0.92)] px-3 py-1.5 text-xs shadow-lg">
      {email ? (
        <>
          <Link href="/office" onClick={closeTip} className="relative shrink-0 font-semibold text-[#a5b4fc]">
            {t('office.nav')}
            {tip && <span aria-hidden className="fx-dot absolute -top-1 -end-2 h-2 w-2 rounded-full bg-[#e0b45a]" />}
          </Link>
          <button type="button" onClick={() => setOpen((v) => !v)} aria-label={email} aria-expanded={open} title={email}
            className="flex items-center whitespace-nowrap text-[#cbd5e1]" dir="ltr">
            <span className="font-bold text-[#e0b45a]">{email.charAt(0)}</span>
            {/* بقية البريد تنطوي إلى عرض صفر فلا يبقى منها أي حرف ظاهر */}
            <span aria-hidden className="fx-collapse overflow-hidden" style={{ maxWidth: open ? '16rem' : '0px', opacity: open ? 1 : 0 }}>{email.slice(1)}</span>
          </button>
          <button onClick={() => sb.auth.signOut()} className="shrink-0 font-semibold text-[#e0b45a]">{t('auth.signout')}</button>
        </>
      ) : (
        <Link href="/login" className="font-semibold text-[#e0b45a]">{t('auth.signin')}</Link>
      )}
      {tip && email && (
        <div role="note" className="fx-pop absolute end-0 top-full mt-2 w-64 rounded-xl border border-[rgba(224,180,90,0.4)] bg-[rgba(15,23,42,0.97)] p-3 text-start text-xs leading-6 text-[#e2e8f0] shadow-xl">
          {t('office.tip')}
          <button onClick={closeTip} className="fx-press mt-2 block font-semibold text-[#e0b45a]">{t('office.tip.ok')}</button>
        </div>
      )}
    </div>
    </>
  );
}
