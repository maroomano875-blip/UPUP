'use client';
// زر Google الرسمي المباشر (Google Identity Services): لا يمرّ المستخدم بعنوان supabase.co
// ثم نسلّم رمز الهوية إلى Supabase عبر signInWithIdToken مع nonce للحماية من إعادة الاستعمال.
// يعمل فقط إن ضُبط NEXT_PUBLIC_GOOGLE_CLIENT_ID؛ وإلا يستعمل المُستدعي الزر القديم (OAuth).
import { useEffect, useRef, useState } from 'react';
import { useI18n } from './I18nProvider';
import { getBrowserSupabase } from '../../lib/supabaseBrowser';
import { authErrorKey } from '../../lib/authPolicy';

type Gid = {
  initialize: (o: Record<string, unknown>) => void;
  renderButton: (el: HTMLElement, o: Record<string, unknown>) => void;
};
declare global { interface Window { google?: { accounts: { id: Gid } } } }

export const GOOGLE_CLIENT_ID = (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '').trim();

const SRC = 'https://accounts.google.com/gsi/client';

function loadScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const ex = document.querySelector<HTMLScriptElement>(`script[src^="${SRC}"]`);
    const s = ex ?? Object.assign(document.createElement('script'), { src: SRC, async: true });
    s.addEventListener('load', () => resolve());
    s.addEventListener('error', () => reject(new Error('gsi_load')));
    if (!ex) document.head.appendChild(s);
  });
}

async function sha256Hex(s: string): Promise<string> {
  const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(h)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export default function GoogleButton({ onError, onFail }: { onError: (text: string) => void; onFail: () => void }) {
  const { lang, t } = useI18n();
  const box = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const sb = getBrowserSupabase();
    if (!sb || !GOOGLE_CLIENT_ID) { onFail(); return; }
    let dead = false;
    (async () => {
      try {
        await loadScript();
        if (dead || !box.current || !window.google) return;
        const raw = Array.from(crypto.getRandomValues(new Uint8Array(16))).map((b) => b.toString(16).padStart(2, '0')).join('');
        const hashed = await sha256Hex(raw);
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          nonce: hashed,
          ux_mode: 'popup',
          use_fedcm_for_prompt: true,
          callback: async (resp: { credential?: string }) => {
            if (!resp.credential) return onError(t('auth.err.generic'));
            setBusy(true);
            const { error } = await sb.auth.signInWithIdToken({ provider: 'google', token: resp.credential, nonce: raw });
            if (error) { onError(t(authErrorKey(error.message))); setBusy(false); }
          },
        });
        box.current.innerHTML = '';
        window.google.accounts.id.renderButton(box.current, {
          type: 'standard', theme: 'filled_black', size: 'large', shape: 'pill',
          text: 'continue_with', width: Math.min(320, box.current.clientWidth || 320), locale: lang,
        });
      } catch { if (!dead) onFail(); }
    })();
    return () => { dead = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  return <div className={`mt-5 flex min-h-[44px] justify-center ${busy ? 'opacity-50' : ''}`} ref={box} aria-label={t('auth.google')} />;
}
