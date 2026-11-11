'use client';
import { useEffect, useState } from 'react';
import { useI18n } from './I18nProvider';
import { convert, fmtMoney, sypBoth, type Rates } from '../../lib/currency';
import { parseNum } from '../../lib/numbers';

// المكافئ بعملة بلد المستخدم عندما تختلف عملة المستند؛ لا يظهر شيء إن تعذّر السعر
export default function CurrencyEquiv({ total, docCur, localCur, locale }: { total: unknown; docCur: unknown; localCur: string; locale: string }) {
  const { t } = useI18n();
  const from = String(docCur ?? '').trim().toUpperCase();
  const amount = parseNum(total, 'en').n;
  const ok = /^[A-Z]{3}$/.test(from) && from !== localCur && amount != null;
  const [r, setR] = useState<Rates | null>(null);
  useEffect(() => {
    if (!ok) return;
    let live = true;
    fetch(`/api/rates?codes=${from},${localCur}`).then((x) => x.json()).then((j) => { if (live && j?.ok) setR(j); }).catch(() => {});
    return () => { live = false; };
  }, [ok, from, localCur]);
  if (!ok || !r) return null;
  const v = convert(amount as number, from, localCur, r);
  if (v == null) return null;
  const note = t('money.note', { date: r.date, src: r.source });
  if (localCur === 'SYP') {
    const b = sypBoth(v, r.usd.syp);
    return (
      <div className="mt-3 rounded-lg border border-[rgba(255,255,255,0.1)] px-3 py-2 text-sm text-[#e2e8f0]" dir="auto">
        <div>≈ {fmtMoney(b.old, 'SYP', locale)} — {t('money.syp.old')}</div>
        <div>≈ {fmtMoney(b.neu, 'SYP', locale)} — {t('money.syp.new')}</div>
        <div className="mt-1 text-xs text-[#94a3b8]">{note}</div>
      </div>
    );
  }
  return (
    <div className="mt-3 rounded-lg border border-[rgba(255,255,255,0.1)] px-3 py-2 text-sm text-[#e2e8f0]" dir="auto">
      <div>≈ {fmtMoney(v, localCur, locale)}</div>
      <div className="mt-1 text-xs text-[#94a3b8]">{note}</div>
    </div>
  );
}
