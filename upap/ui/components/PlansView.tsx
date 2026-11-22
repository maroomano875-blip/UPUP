'use client';
// صفحة الاشتراكات: الخطط من قاعدة البيانات، والشراء والدفع بـ USDT داخل الصفحة نفسها.
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useI18n } from './I18nProvider';
import { getBrowserSupabase } from '../../lib/supabaseBrowser';
import PayModal from './PayModal';

type Plan = { code: string; name: string; max_members: number; monthly_analyses: number; price_weekly_usdt: number | null; price_monthly_usdt: number | null; price_yearly_usdt: number | null; kind: string };
type Period = 'weekly' | 'monthly' | 'yearly';
type Sub = { plan: string; period: string; expires_at: string; scope: string } | null;

export default function PlansView() {
  const { t } = useI18n();
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [period, setPeriod] = useState<Period>('monthly');
  const [buy, setBuy] = useState<Plan | null>(null);
  const [sub, setSub] = useState<Sub>(null);
  const [logged, setLogged] = useState<boolean | null>(null);
  const [loadErr, setLoadErr] = useState('');

  const loadSub = useCallback(() => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    sb.rpc('my_subscription').then(({ data }) => setSub((data as Sub) ?? null));
  }, []);

  useEffect(() => {
    const sb = getBrowserSupabase();
    if (!sb) { setPlans([]); return; }
    const cols = 'code,name,max_members,monthly_analyses,price_weekly_usdt,price_monthly_usdt,price_yearly_usdt';
    (async () => {
      // نحاول بعمود kind أولاً؛ إن تعذّر نقرأ بدونه ونستنتج النوع من الرمز
      let r = await sb.from('plans').select(`${cols},kind`).eq('is_active', true).order('price_monthly_usdt');
      if (r.error) {
        setLoadErr(r.error.message);
        const r2 = await sb.from('plans').select(cols).eq('is_active', true).order('price_monthly_usdt');
        if (!r2.error) { setPlans(((r2.data ?? []) as Omit<Plan, 'kind'>[]).map((p) => ({ ...p, kind: p.code === 'individual' ? 'individual' : 'office' }))); return; }
        setLoadErr(`${r.error.message} | ${r2.error.message}`);
      }
      setPlans((r.data as Plan[] | null) ?? []);
    })();
    sb.auth.getSession().then(({ data }) => { setLogged(!!data.session); if (data.session) loadSub(); });
  }, [loadSub]);

  const nameOf = (p: Plan) => (['individual', 'small', 'medium', 'large'].includes(p.code) ? t(`plans.${p.code}` as never) : p.name);
  const priceOf = (p: Plan): number | null => (period === 'weekly' ? p.price_weekly_usdt : period === 'monthly' ? p.price_monthly_usdt : p.price_yearly_usdt);
  const perMonth = (p: Plan) => (p.price_yearly_usdt != null ? (p.price_yearly_usdt / 12).toFixed(2).replace(/\.?0+$/, '') : '');
  const group = (kind: string) => (plans ?? []).filter((p) => p.kind === kind);

  const card = (p: Plan, i: number) => {
    const price = priceOf(p);
    const popular = p.code === 'medium';
    return (
      <div key={p.code} style={{ animationDelay: `${i * 120}ms` }} className={`fx-rise fx-card relative p-5 transition hover:-translate-y-1 ${popular ? 'border-[rgba(224,180,90,0.7)] shadow-[0_0_30px_-8px_rgba(224,180,90,0.5)]' : ''}`}>
        {popular && <span className="absolute -top-3 start-5 rounded-full bg-[#e0b45a] px-3 py-0.5 text-xs font-bold text-[#0f172a]">{t('plans.popular')}</span>}
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-xl font-bold text-[#e0b45a]">{nameOf(p)}</h3>
          <span className="text-end" dir="ltr">
            <span className="text-2xl font-bold">{price ?? '—'}</span> <span className="text-xs text-[#cbd5e1]">USDT</span>
          </span>
        </div>
        {period === 'yearly' && price != null && <p className="mt-1 text-end text-xs text-[#6ee7b7]">{t('plans.perMonth', { n: perMonth(p) })}</p>}
        <ul className="mt-3 space-y-1 text-sm leading-7 text-[#e2e8f0]">
          <li>✓ {p.kind === 'individual' ? t('plans.solo') : t('plans.members', { n: p.max_members })}</li>
          <li>✓ {t('plans.analyses', { n: p.monthly_analyses })}</li>
        </ul>
        <button disabled={price == null || logged === false} onClick={() => setBuy(p)}
          className="fx-press mt-4 w-full rounded-lg bg-[#e0b45a] px-4 py-2.5 text-sm font-bold text-[#0f172a] disabled:opacity-40">
          {logged === false ? t('plans.loginFirst') : t('plans.subscribe')}
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Link href="/" aria-label={t('office.back')} className="fx-press mb-3 inline-flex items-center gap-1 text-sm font-semibold text-[#a5b4fc]">
        <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="rtl:rotate-180"><path d="M15 6l-6 6 6 6" /></svg>
        {t('common.home')}
      </Link>
      <div className="fx-rise text-center">
        <h1 className="text-3xl font-bold">{t('plans.title')}</h1>
        <p className="mt-2 text-sm leading-7 text-[#cbd5e1]">{t('plans.sub')}</p>
        <p className="mt-1 text-xs text-[#e0b45a]">{t('plans.trialNote')}</p>
      </div>

      {sub && (
        <div className="fx-pop rounded-xl border border-[rgba(110,231,183,0.4)] bg-[rgba(16,185,129,0.1)] px-4 py-3 text-sm leading-7 text-[#6ee7b7]">
          {t('plans.current', { plan: t(`plans.${sub.plan}` as never), d: new Date(sub.expires_at).toLocaleDateString() })}
        </div>
      )}

      <div className="flex gap-1 rounded-full border border-[rgba(255,255,255,0.15)] p-1 text-sm">
        {(['weekly', 'monthly', 'yearly'] as Period[]).map((x) => (
          <button key={x} onClick={() => setPeriod(x)} className={`fx-press flex-1 rounded-full px-2 py-2 font-bold transition ${period === x ? 'bg-[#e0b45a] text-[#0f172a]' : 'text-[#cbd5e1]'}`}>
            {t(`plans.period.${x}` as never)}
          </button>
        ))}
      </div>
      {period === 'yearly' && <p className="fx-pop text-center text-xs font-semibold text-[#6ee7b7]">{t('plans.yearlyDeal')}</p>}

      {plans === null && <div className="h-40 animate-pulse rounded-2xl bg-[rgba(255,255,255,0.06)]" aria-label={t('plans.loading')} />}
      {plans !== null && plans.length === 0 && <p className="rounded-lg bg-[rgba(239,68,68,0.15)] px-3 py-2 text-center text-sm text-[#fca5a5]">{t(loadErr ? 'plans.loadErr' : 'plans.empty')}{loadErr && <span dir="ltr" className="mt-1 block text-xs opacity-80">{loadErr}</span>}</p>}
      {group('individual').length > 0 && <h2 className="pt-2 text-sm font-bold text-[#a5b4fc]">{t('plans.groupSolo')}</h2>}
      {group('individual').map(card)}
      {group('office').length > 0 && <h2 className="pt-2 text-sm font-bold text-[#a5b4fc]">{t('plans.groupOffice')}</h2>}
      {group('office').map(card)}
      <p className="text-center text-xs leading-6 text-[#94a3b8]">{t('plans.officeLock')}</p>
      <Link href="/office" className="fx-press block text-center text-xs text-[#a5b4fc]">{t('office.nav')}</Link>

      {buy && <PayModal plan={buy.code} period={period} planLabel={nameOf(buy)} onClose={() => setBuy(null)} onPaid={loadSub} />}
    </div>
  );
}
