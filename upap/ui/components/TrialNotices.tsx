'use client';
// إشعارات التجربة المجانية: ترحيب عند الدخول، ثم إشعار لكل فرصة (1 ثم 2 ثم 3)، ونافذة اشتراك بعد الثالثة.
// الحالة من /api/me (الخادم يعرف الاستثناءات والتفعيل)؛ الأوقات بتوقيت جهاز المستخدم.
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useI18n } from './I18nProvider';
import { useToast } from './ToastProvider';
import { getBrowserSupabase } from '../../lib/supabaseBrowser';

type Trial = { has_trial: boolean; used_total: number; max: number; finished: boolean; used_today?: boolean; next_at?: string };
type Me = { enforce: boolean; exempt: boolean; trial: Trial | null };

export const EV_DONE = 'upap:analysis-done';
export const EV_ENDED = 'upap:trial-ended';

export default function TrialNotices() {
  const { t, lang } = useI18n();
  const { push } = useToast();
  const [nudge, setNudge] = useState(false);
  const welcomed = useRef<string | null>(null);

  const fetchMe = useCallback(async (): Promise<{ me: Me; uid: string } | null> => {
    const sb = getBrowserSupabase();
    if (!sb) return null;
    const { data } = await sb.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return null;
    try {
      const r = await fetch('/api/me', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
      if (!r.ok) return null;
      return { me: (await r.json()) as Me, uid: data.session!.user.id };
    } catch { return null; }
  }, []);

  const when = useCallback((iso?: string) => (iso ? new Date(iso).toLocaleString(lang, { weekday: 'short', hour: '2-digit', minute: '2-digit' }) : ''), [lang]);

  // ترحيب مرة لكل جلسة متصفح بعد الدخول
  const welcome = useCallback(async () => {
    const r = await fetchMe();
    if (!r || !r.me.enforce || r.me.exempt) return;
    if (welcomed.current === r.uid) return;
    try { if (window.sessionStorage.getItem('upap_welcomed') === r.uid) return; window.sessionStorage.setItem('upap_welcomed', r.uid); } catch { /* التخزين غير متاح */ }
    welcomed.current = r.uid;
    const tr = r.me.trial;
    if (!tr || !tr.has_trial) {
      push({ kind: 'success', title: t('notice.welcome.new.title'), body: t('notice.welcome.new.body'), ttl: 9000 });
    } else if (tr.finished) {
      push({ kind: 'warn', title: t('notice.welcome.done.title'), body: t('notice.welcome.done.body'), action: { label: t('notice.subscribe'), href: '/subscribe' }, ttl: 9000 });
    } else {
      push({
        kind: 'info', title: t('notice.welcome.active.title', { used: tr.used_total }),
        body: tr.used_today ? t('notice.welcome.active.used', { time: when(tr.next_at) }) : t('notice.welcome.active.avail'), ttl: 8000,
      });
    }
  }, [fetchMe, push, t, when]);

  useEffect(() => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    welcome();
    const { data: sub } = sb.auth.onAuthStateChange((e) => { if (e === 'SIGNED_IN') welcome(); });
    return () => sub.subscription.unsubscribe();
  }, [welcome]);

  // بعد كل تحليل ناجح: إشعار الفرصة رقم n، وبعد الثالثة نافذة الاشتراك
  useEffect(() => {
    const onDone = async () => {
      const r = await fetchMe();
      const tr = r?.me.trial;
      if (!r || !r.me.enforce || r.me.exempt || !tr?.has_trial || tr.used_total < 1) return;
      const n = Math.min(tr.used_total, 3);
      const last = tr.used_total >= tr.max;
      push({
        kind: last ? 'warn' : 'success', title: t(`notice.try.${n}` as never),
        body: last ? t('notice.try.last') : t('notice.try.next', { time: when(tr.next_at) }),
        action: last ? { label: t('notice.subscribe'), href: '/subscribe' } : undefined, ttl: 9000,
      });
      if (last) window.setTimeout(() => setNudge(true), 2600);
    };
    const onEnded = () => setNudge(true);
    window.addEventListener(EV_DONE, onDone);
    window.addEventListener(EV_ENDED, onEnded);
    return () => { window.removeEventListener(EV_DONE, onDone); window.removeEventListener(EV_ENDED, onEnded); };
  }, [fetchMe, push, t, when]);

  if (!nudge) return null;
  return (
    <div className="fx-backdrop fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(2,6,23,0.8)] px-5" role="dialog" aria-modal="true">
      <div className="fx-pop fx-card w-full max-w-sm p-6 text-center">
        <div className="fx-float mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(224,180,90,0.18)] text-2xl text-[#e0b45a]" aria-hidden>★</div>
        <h2 className="text-xl font-bold">{t('nudge.title')}</h2>
        <p className="mt-2 text-sm leading-7 text-[#cbd5e1]">{t('nudge.body')}</p>
        <Link href="/subscribe" onClick={() => setNudge(false)} className="fx-glow fx-press mt-5 block rounded-lg bg-[#e0b45a] px-4 py-3 text-sm font-bold text-[#020617]">{t('notice.subscribe')}</Link>
        <button onClick={() => setNudge(false)} className="fx-press mt-3 text-xs font-semibold text-[#94a3b8]">{t('nudge.later')}</button>
      </div>
    </div>
  );
}
