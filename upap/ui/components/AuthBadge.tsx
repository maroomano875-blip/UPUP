'use client';
// القائمة الجانبية للتطبيق (تحلّ محل الشارة العائمة ومبدّل اللغة العائم):
// زر ثابت أعلى الصفحة يفتح لوحة معتمة فيها الحساب والمكتب والاشتراكات واللغة والخروج.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from './I18nProvider';
import UiLangSwitch from './UiLangSwitch';
import LegalLinks from './LegalLinks';
import { getBrowserSupabase } from '../../lib/supabaseBrowser';

export default function AuthBadge() {
  const { t } = useI18n();
  const pathname = usePathname();
  const sb = getBrowserSupabase();
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [tip, setTip] = useState(false);

  // تنويه يظهر مرة واحدة لكل متصفح بعد الدخول: «مكتبي» موجودة بالقائمة
  useEffect(() => {
    if (!email) { setTip(false); return; }
    try { if (window.localStorage.getItem('upap_office_tip') !== '1') setTip(true); } catch { /* التخزين غير متاح */ }
  }, [email]);
  const closeTip = () => { setTip(false); try { window.localStorage.setItem('upap_office_tip', '1'); } catch { /* تجاهل */ } };

  useEffect(() => {
    if (!sb) { setReady(true); return; }
    sb.auth.getSession().then(({ data }) => { setEmail(data.session?.user.email ?? null); setReady(true); });
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => { setEmail(session?.user.email ?? null); setReady(true); });
    return () => sub.subscription.unsubscribe();
  }, [sb]);

  // إغلاق عند تغيّر الصفحة أو بزر Escape، ومنع تمرير الصفحة خلف اللوحة
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open]);

  if (!ready) return null;

  const item = 'block rounded-lg px-3 py-3 text-sm font-semibold text-[#e2e8f0] hover:bg-[rgba(255,255,255,0.08)]';
  const close = () => { setOpen(false); closeTip(); };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label={t('menu.open')} aria-expanded={open}
        className="fixed top-3 end-3 z-50 grid h-11 w-11 place-items-center rounded-full border border-[rgba(255,255,255,0.25)] bg-[#0f172a] text-[#f1f5f9] shadow-lg">
        <span aria-hidden className="space-y-1.5">
          <span className="block h-0.5 w-5 bg-current" /><span className="block h-0.5 w-5 bg-current" /><span className="block h-0.5 w-5 bg-current" />
        </span>
        {tip && email && <span aria-hidden className="fx-dot absolute -top-0.5 -end-0.5 h-3 w-3 rounded-full bg-[#e0b45a]" />}
      </button>

      {open && (
        <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label={t('menu.open')}>
          <button type="button" aria-label={t('menu.close')} onClick={() => setOpen(false)} className="absolute inset-0 bg-[rgba(2,6,23,0.7)]" />
          <aside className="absolute inset-y-0 end-0 flex w-72 max-w-[85vw] flex-col gap-4 overflow-y-auto border-s border-[rgba(255,255,255,0.15)] bg-[#0b1224] p-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-[#a5b4fc]">UPAP</span>
              <button type="button" onClick={() => setOpen(false)} aria-label={t('menu.close')} className="grid h-9 w-9 place-items-center rounded-full border border-[rgba(255,255,255,0.2)] text-lg leading-none">×</button>
            </div>

            {email ? (
              <div className="rounded-xl border border-[rgba(255,255,255,0.12)] bg-[#0f172a] p-3" dir="ltr">
                <div className="text-[11px] text-[#94a3b8]" dir="auto">{t('menu.account')}</div>
                <div className="mt-1 truncate text-sm font-semibold text-[#e0b45a]" title={email}>{email}</div>
              </div>
            ) : null}

            <nav className="space-y-1">
              <Link href="/" className={item}>{t('menu.home')}</Link>
              {email ? (
                <>
                  <Link href="/subscribe" className={item}>{t('plans.title')}</Link>
                  <Link href="/office" onClick={closeTip} className={item}>{t('office.nav')}</Link>
                </>
              ) : (
                pathname !== '/login' && <Link href="/login" className={`${item} text-[#e0b45a]`}>{t('auth.signin')}</Link>
              )}
            </nav>

            {tip && email && (
              <p role="note" className="rounded-lg border border-[rgba(224,180,90,0.4)] bg-[#0f172a] p-3 text-xs leading-6 text-[#e2e8f0]">
                {t('office.tip')} <button onClick={close} className="font-semibold text-[#e0b45a]">{t('office.tip.ok')}</button>
              </p>
            )}

            <div className="space-y-2">
              <div className="text-xs text-[#94a3b8]">{t('lang.label')}</div>
              <UiLangSwitch />
            </div>

            <div className="mt-auto space-y-4">
              <LegalLinks />
              {email && sb && (
                <button type="button" onClick={() => { setOpen(false); sb.auth.signOut(); }}
                  className="w-full rounded-lg border border-[rgba(224,180,90,0.5)] py-2.5 text-sm font-bold text-[#e0b45a]">{t('auth.signout')}</button>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
