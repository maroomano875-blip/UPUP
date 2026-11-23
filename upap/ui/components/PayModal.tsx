'use client';
// نافذة الدفع داخل الصفحة نفسها: المبلغ الدقيق + العنوان + QR + عدّاد ساعتين + تحقق تلقائي من وصول الدفعة.
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { useI18n } from './I18nProvider';
import { useToast } from './ToastProvider';
import Burst from './Burst';
import { getBrowserSupabase } from '../../lib/supabaseBrowser';

type Order = { orderId: string; amount: number; address: string; expiresAt: string };
type Props = { plan: string; period: 'weekly' | 'monthly' | 'yearly'; planLabel: string; onClose: () => void; onPaid: () => void };
const POLL_MS = 12_000;

export default function PayModal({ plan, period, planLabel, onClose, onPaid }: Props) {
  const { t } = useI18n();
  const toast = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [state, setState] = useState<'loading' | 'pending' | 'paid' | 'expired'>('loading');
  const [qr, setQr] = useState('');
  const [left, setLeft] = useState(0);
  const [burst, setBurst] = useState(0);
  const [copied, setCopied] = useState('');
  const doneRef = useRef(false);

  const token = useCallback(async () => (await getBrowserSupabase()?.auth.getSession())?.data.session?.access_token ?? null, []);

  const finish = useCallback((expires: string | null) => {
    if (doneRef.current) return;
    doneRef.current = true;
    setState('paid'); setBurst(Date.now());
    toast.push({ kind: 'success', title: t('pay.done.title'), body: expires ? t('pay.done.body', { d: new Date(expires).toLocaleDateString() }) : undefined, ttl: 9000 });
    window.dispatchEvent(new Event('upap:subscribed'));
    onPaid();
  }, [onPaid, t, toast]);

  // إنشاء الطلب عند الفتح
  useEffect(() => {
    let live = true;
    (async () => {
      const tk = await token();
      if (!tk) { setErr('auth_required'); return; }
      const r = await fetch('/api/billing/order', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tk}` }, body: JSON.stringify({ plan, period }) }).catch(() => null);
      const j = r ? await r.json().catch(() => ({})) : {};
      if (!live) return;
      if (!r || !r.ok) { setErr(j.error ?? 'generic'); return; }
      if (j.status === 'paid') { finish(j.expiresAt ?? null); return; }
      setOrder(j as Order); setState('pending');
      setQr(await QRCode.toDataURL(j.address, { margin: 1, width: 220, color: { dark: '#0f172a', light: '#ffffff' } }));
    })();
    return () => { live = false; };
  }, [plan, period, token, finish]);

  // عدّاد الوقت
  useEffect(() => {
    if (!order || state !== 'pending') return;
    const tick = () => { const s = Math.max(0, Math.floor((Date.parse(order.expiresAt) - Date.now()) / 1000)); setLeft(s); };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [order, state]);

  // تحقق دوري تلقائي
  useEffect(() => {
    if (!order || state !== 'pending') return;
    let stop = false;
    const poll = async () => {
      const tk = await token();
      if (!tk || stop) return;
      const r = await fetch(`/api/billing/order?id=${order.orderId}`, { headers: { Authorization: `Bearer ${tk}` } }).catch(() => null);
      const j = r ? await r.json().catch(() => ({})) : {};
      if (stop || !r?.ok) return;
      if (j.status === 'paid') finish(j.expiresAt ?? null);
      else if (j.status === 'expired') setState('expired');
    };
    const id = window.setInterval(poll, POLL_MS);
    // المتصفح على الجوال يجمّد المؤقتات حين تغادر الصفحة؛ نفحص فوراً عند العودة إليها
    const onBack = () => { if (document.visibilityState === 'visible') void poll(); };
    document.addEventListener('visibilitychange', onBack);
    window.addEventListener('focus', onBack);
    window.addEventListener('pageshow', onBack);
    return () => {
      stop = true; window.clearInterval(id);
      document.removeEventListener('visibilitychange', onBack);
      window.removeEventListener('focus', onBack);
      window.removeEventListener('pageshow', onBack);
    };
  }, [order, state, token, finish]);

  const copy = async (what: 'amount' | 'address', text: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(what); window.setTimeout(() => setCopied(''), 1800); } catch { /* النسخ غير متاح */ }
  };
  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(left % 60).padStart(2, '0');
  const amountText = order ? order.amount.toFixed(3) : '';

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[70] flex items-end justify-center bg-[rgba(2,6,23,0.8)] p-3 sm:items-center" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="fx-pop fx-card relative max-h-[92vh] w-full max-w-md overflow-y-auto p-5">
        <Burst show={burst} />
        <button onClick={onClose} aria-label={t('pay.close')} className="fx-press absolute end-3 top-3 text-xl text-[#94a3b8]">×</button>
        <h2 className="pe-6 text-xl font-bold text-[#e0b45a]">{t('pay.title', { plan: planLabel })}</h2>

        {err && (
          <div className="mt-4 space-y-3 text-sm leading-7">
            <p className="rounded-lg bg-[rgba(239,68,68,0.15)] px-3 py-2 text-[#fca5a5]">{t(`pay.err.${['office_owner_required','in_office','too_many_orders','wallet_missing','tron_unavailable','auth_required'].includes(err) ? err : 'generic'}` as never)}</p>
            {err === 'office_owner_required' && <Link href="/office" className="fx-press block text-center font-semibold text-[#a5b4fc]">{t('office.nav')}</Link>}
          </div>
        )}

        {!err && state === 'loading' && <div className="mt-4 h-40 animate-pulse rounded-xl bg-[rgba(255,255,255,0.06)]" />}

        {state === 'pending' && order && (
          <div className="mt-3 space-y-4 text-center">
            <p className="text-sm leading-7 text-[#cbd5e1]">{t('pay.exact')}</p>
            <button onClick={() => copy('amount', amountText)} className="fx-press w-full rounded-xl border border-[rgba(224,180,90,0.6)] bg-[rgba(224,180,90,0.08)] py-3" dir="ltr">
              <span className="text-3xl font-bold text-[#e0b45a]">{amountText}</span> <span className="text-sm text-[#cbd5e1]">USDT</span>
              <span className="mt-1 block text-xs text-[#94a3b8]">{copied === 'amount' ? t('pay.copied') : t('pay.tapCopy')}</span>
            </button>
            {qr && <img src={qr} alt="QR" width={190} height={190} className="mx-auto rounded-lg bg-white p-1" />}
            <button onClick={() => copy('address', order.address)} className="fx-press block w-full break-all rounded-lg border border-[rgba(255,255,255,0.2)] px-3 py-2 text-xs text-[#e2e8f0]" dir="ltr">
              {order.address}
              <span className="mt-1 block text-[#94a3b8]">{copied === 'address' ? t('pay.copied') : t('pay.tapCopy')}</span>
            </button>
            <p className="text-xs text-[#fca5a5]">{t('pay.network')}</p>
            <p className="text-xs leading-6 text-[#e0b45a]">{t('pay.fee')}</p>
            <p className="text-sm text-[#cbd5e1]"><span className="fx-dot me-2 inline-block h-2 w-2 rounded-full bg-[#e0b45a]" />{t('pay.waiting')} <b dir="ltr" className="text-[#e0b45a]">{mm}:{ss}</b></p>
          </div>
        )}

        {state === 'paid' && (
          <div className="mt-6 space-y-3 text-center">
            <div className="fx-pop text-5xl">✓</div>
            <p className="text-lg font-bold text-[#6ee7b7]">{t('pay.done.title')}</p>
            <button onClick={onClose} className="fx-press w-full rounded-lg bg-[#e0b45a] px-4 py-2.5 text-sm font-bold text-[#0f172a]">{t('pay.close')}</button>
          </div>
        )}

        {state === 'expired' && (
          <div className="mt-4 space-y-3 text-center text-sm leading-7">
            <p className="rounded-lg bg-[rgba(239,68,68,0.15)] px-3 py-2 text-[#fca5a5]">{t('pay.expired')}</p>
            <button onClick={onClose} className="fx-press w-full rounded-lg border border-[rgba(255,255,255,0.2)] px-4 py-2.5 font-bold">{t('pay.close')}</button>
          </div>
        )}
      </div>
    </div>
  );
}
