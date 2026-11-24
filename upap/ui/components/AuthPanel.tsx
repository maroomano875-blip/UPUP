'use client';
// لوحة تسجيل الدخول: Google دائماً، والإيميل + كلمة المرور خلف مفتاح تشغيل
// (NEXT_PUBLIC_EMAIL_AUTH=on) حتى يُربط Brevo لإرسال رسائل التأكيد.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useI18n } from './I18nProvider';
import { getBrowserSupabase } from '../../lib/supabaseBrowser';
import { authErrorKey, isAllowedEmailDomain, normalizeEmail, passwordIssue } from '../../lib/authPolicy';

type Msg = { kind: 'ok' | 'err'; text: string } | null;

// embedded: يُعرض داخل صفحة أخرى (لا يعيد التوجيه ولا يعرض رابط العودة)؛ next: وجهة ما بعد الدخول
export default function AuthPanel({ embedded = false, next }: { embedded?: boolean; next?: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const sb = getBrowserSupabase();
  const emailOn = process.env.NEXT_PUBLIC_EMAIL_AUTH === 'on';
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);

  // وجهة ما بعد الدخول: next أو ما حُفظ قبل الذهاب إلى Google؛ مسار داخلي فقط (منع التحويل الخارجي)
  function target() {
    let n: string | null | undefined = next;
    try { n = n ?? window.localStorage.getItem('upap_next'); window.localStorage.removeItem('upap_next'); } catch { /* التخزين غير متاح */ }
    return n && n.startsWith('/') && !n.startsWith('//') ? n : '/';
  }

  // بعد نجاح الدخول (بما فيه العودة من Google) ننتقل للوجهة؛ داخل صفحة أخرى تتولى هي التحديث
  useEffect(() => {
    if (!sb || embedded) return;
    sb.auth.getSession().then(({ data }) => { if (data.session) router.replace(target()); });
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => { if (session) router.replace(target()); });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sb, router, embedded, next]);

  async function google() {
    if (!sb) return setMsg({ kind: 'err', text: t('auth.err.config') });
    setBusy(true); setMsg(null);
    try { if (next) window.localStorage.setItem('upap_next', next); } catch { /* التخزين غير متاح */ }
    const { error } = await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/login` } });
    if (error) { setMsg({ kind: 'err', text: t(authErrorKey(error.message)) }); setBusy(false); }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!sb) return setMsg({ kind: 'err', text: t('auth.err.config') });
    const em = normalizeEmail(email);
    if (mode === 'signup') {
      if (!isAllowedEmailDomain(em)) return setMsg({ kind: 'err', text: t('auth.err.domain') });
      if (passwordIssue(password)) return setMsg({ kind: 'err', text: t('auth.err.password') });
    }
    setBusy(true); setMsg(null);
    if (mode === 'signup') {
      const { error } = await sb.auth.signUp({ email: em, password, options: { emailRedirectTo: `${window.location.origin}/login` } });
      setMsg(error ? { kind: 'err', text: t(authErrorKey(error.message)) } : { kind: 'ok', text: t('auth.ok.confirm') });
    } else {
      const { error } = await sb.auth.signInWithPassword({ email: em, password });
      if (error) setMsg({ kind: 'err', text: t(authErrorKey(error.message)) });
    }
    setBusy(false);
  }

  // رابط إعادة تعيين كلمة المرور: ردّ موحّد دائماً (لا نكشف هل البريد مسجّل)
  async function forgot() {
    if (!sb) return setMsg({ kind: 'err', text: t('auth.err.config') });
    const em = normalizeEmail(email);
    if (!em) return setMsg({ kind: 'err', text: t('auth.err.needEmail') });
    setBusy(true); setMsg(null);
    const { error } = await sb.auth.resetPasswordForEmail(em, { redirectTo: `${window.location.origin}/reset-password` });
    setMsg(error && /rate|security|seconds/i.test(error.message) ? { kind: 'err', text: t('auth.err.rate') } : { kind: 'ok', text: t('auth.ok.reset') });
    setBusy(false);
  }

  const input = 'w-full rounded-lg border border-[rgba(255,255,255,0.15)] bg-[rgba(2,6,23,0.8)] px-3 py-2.5 text-sm text-[#f1f5f9] outline-none focus:border-[#e0b45a]';

  return (
    <div className={embedded ? 'w-full' : 'fx-rise fx-card mx-auto w-full max-w-sm p-6'}>
      {embedded ? <h2 className="text-lg font-bold">{t('auth.title')}</h2> : <h1 className="text-2xl font-bold">{t('auth.title')}</h1>}

      <button onClick={google} disabled={busy || !sb}
        className="fx-glow fx-press mt-5 w-full rounded-lg bg-[#e0b45a] px-4 py-3 text-sm font-bold text-[#020617] disabled:opacity-50">
        {t('auth.google')}
      </button>

      {emailOn && (
        <>
          <div className="my-5 flex items-center gap-3 text-xs text-[#64748b]">
            <span className="h-px flex-1 bg-[rgba(255,255,255,0.1)]" />{t('auth.or')}<span className="h-px flex-1 bg-[rgba(255,255,255,0.1)]" />
          </div>
          <div className="mb-3 grid grid-cols-2 gap-1 rounded-lg bg-[rgba(2,6,23,0.6)] p-1 text-xs font-semibold">
            {(['signin', 'signup'] as const).map((m) => (
              <button key={m} type="button" onClick={() => { setMode(m); setMsg(null); }} aria-pressed={mode === m}
                className={`rounded-md py-2 ${mode === m ? 'bg-[rgba(255,255,255,0.12)] text-[#f1f5f9]' : 'text-[#94a3b8]'}`}>
                {t(m === 'signin' ? 'auth.mode.signin' : 'auth.mode.signup')}
              </button>
            ))}
          </div>
          <form onSubmit={submit} className="space-y-3">
            <input type="email" required autoComplete="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.email')} aria-label={t('auth.email')} className={input} />
            <input type="password" required autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} dir="ltr"
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.password')} aria-label={t('auth.password')} className={input} />
            {mode === 'signin' && (
              <button type="button" onClick={forgot} disabled={busy || !sb} className="block text-xs text-[#a5b4fc] underline disabled:opacity-50">{t('auth.forgot')}</button>
            )}
            {mode === 'signup' && <p className="text-xs leading-6 text-[#94a3b8]">{t('auth.hint.domain')} {t('auth.hint.password')}</p>}
            <button type="submit" disabled={busy || !sb}
              className="w-full rounded-lg border border-[rgba(255,255,255,0.2)] px-4 py-2.5 text-sm font-bold disabled:opacity-50">
              {t(mode === 'signin' ? 'auth.submit.signin' : 'auth.submit.signup')}
            </button>
          </form>
        </>
      )}

      {msg && (
        <p role="status" className={`fx-pop mt-4 rounded-lg px-3 py-2 text-sm leading-6 ${msg.kind === 'ok' ? 'bg-[rgba(16,185,129,0.15)] text-[#6ee7b7]' : 'bg-[rgba(239,68,68,0.15)] text-[#fca5a5]'}`}>{msg.text}</p>
      )}
      {!sb && <p className="mt-4 text-sm text-[#fca5a5]">{t('auth.err.config')}</p>}

      {!embedded && <Link href="/" className="mt-6 block text-center text-xs text-[#a5b4fc]">{t('auth.back')}</Link>}
    </div>
  );
}
