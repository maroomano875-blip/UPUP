'use client';
// تعيين كلمة مرور جديدة بعد فتح رابط الاستعادة (Supabase يضع جلسة استعادة مؤقتة من الرابط)
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useI18n } from './I18nProvider';
import { getBrowserSupabase } from '../../lib/supabaseBrowser';
import { authErrorKey, passwordIssue } from '../../lib/authPolicy';

export default function ResetPassword() {
  const { t } = useI18n();
  const router = useRouter();
  const sb = getBrowserSupabase();
  const [ready, setReady] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    if (!sb) { setReady(false); return; }
    let done = false;
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => { if (session) { done = true; setReady(true); } });
    sb.auth.getSession().then(({ data }) => { if (data.session) { done = true; setReady(true); } });
    const timer = setTimeout(() => { if (!done) setReady(false); }, 4000);
    return () => { sub.subscription.unsubscribe(); clearTimeout(timer); };
  }, [sb]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!sb) return;
    if (passwordIssue(password)) return setMsg({ kind: 'err', text: t('auth.err.password') });
    setBusy(true); setMsg(null);
    const { error } = await sb.auth.updateUser({ password });
    if (error) { setMsg({ kind: 'err', text: t(authErrorKey(error.message)) }); setBusy(false); return; }
    setMsg({ kind: 'ok', text: t('reset.ok') });
    setTimeout(() => router.replace('/'), 1500);
  }

  const input = 'w-full rounded-lg border border-[rgba(255,255,255,0.15)] bg-[rgba(2,6,23,0.8)] px-3 py-2.5 text-sm text-[#f1f5f9] outline-none focus:border-[#e0b45a]';
  return (
    <div className="fx-rise fx-card mx-auto w-full max-w-sm p-6">
      <h1 className="text-2xl font-bold">{t('reset.title')}</h1>
      {ready === false && (
        <>
          <p className="mt-4 text-sm leading-6 text-[#fca5a5]">{t('reset.noSession')}</p>
          <Link href="/login" className="mt-4 block text-center text-sm text-[#a5b4fc] underline">{t('reset.toLogin')}</Link>
        </>
      )}
      {ready !== false && (
        <form onSubmit={submit} className="mt-5 space-y-3">
          <input type="password" required autoComplete="new-password" dir="ltr" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder={t('reset.new')} aria-label={t('reset.new')} className={input} />
          <p className="text-xs leading-6 text-[#94a3b8]">{t('auth.hint.password')}</p>
          <button type="submit" disabled={busy || !ready}
            className="w-full rounded-lg bg-[#e0b45a] px-4 py-2.5 text-sm font-bold text-[#020617] disabled:opacity-50">{t('reset.submit')}</button>
        </form>
      )}
      {msg && <p role="status" className={`fx-pop mt-4 rounded-lg px-3 py-2 text-sm leading-6 ${msg.kind === 'ok' ? 'bg-[rgba(16,185,129,0.15)] text-[#6ee7b7]' : 'bg-[rgba(239,68,68,0.15)] text-[#fca5a5]'}`}>{msg.text}</p>}
    </div>
  );
}
