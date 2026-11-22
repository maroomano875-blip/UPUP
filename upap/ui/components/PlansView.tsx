'use client';
// صفحة الاشتراكات: الخطط من قاعدة البيانات (قراءة عامة). الدفع بـ USDT يُضاف في المرحلة 5.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useI18n } from './I18nProvider';
import { getBrowserSupabase } from '../../lib/supabaseBrowser';

type Plan = { code: string; name: string; max_members: number; monthly_analyses: number; price_weekly_usdt: number | null; price_monthly_usdt: number | null; price_yearly_usdt: number | null };

export default function PlansView() {
  const { t } = useI18n();
  const [plans, setPlans] = useState<Plan[] | null>(null);

  useEffect(() => {
    const sb = getBrowserSupabase();
    if (!sb) { setPlans([]); return; }
    sb.from('plans').select('code,name,max_members,monthly_analyses,price_weekly_usdt,price_monthly_usdt,price_yearly_usdt')
      .eq('is_active', true).order('max_members').then(({ data }) => setPlans((data as Plan[] | null) ?? []));
  }, []);

  const nameOf = (p: Plan) => (['small', 'medium', 'large'].includes(p.code) ? t(`plans.${p.code}` as never) : p.name);
  const priceOf = (p: Plan) => (p.price_monthly_usdt != null ? `${p.price_monthly_usdt} USDT` : t('plans.priceSoon'));

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
      {plans === null && <div className="h-40 animate-pulse rounded-2xl bg-[rgba(255,255,255,0.06)]" aria-label={t('plans.loading')} />}
      {plans?.map((p, i) => (
        <div key={p.code} style={{ animationDelay: `${i * 120}ms` }} className={`fx-rise fx-card p-5 transition hover:-translate-y-1 ${p.code === 'medium' ? 'border-[rgba(224,180,90,0.6)]' : ''}`}>
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-xl font-bold text-[#e0b45a]">{nameOf(p)}</h2>
            <span className="text-sm text-[#cbd5e1]">{priceOf(p)}</span>
          </div>
          <ul className="mt-3 space-y-1 text-sm leading-7 text-[#e2e8f0]">
            <li>✓ {t('plans.members', { n: p.max_members })}</li>
            <li>✓ {t('plans.analyses', { n: p.monthly_analyses })}</li>
          </ul>
          <button disabled className="mt-4 w-full rounded-lg border border-[rgba(255,255,255,0.2)] px-4 py-2.5 text-sm font-bold text-[#94a3b8]">{t('plans.cta')}</button>
        </div>
      ))}
      <Link href="/office" className="fx-press block text-center text-xs text-[#a5b4fc]">{t('office.nav')}</Link>
    </div>
  );
}
