'use client';
// شارة حالة التجربة المجانية (تظهر فقط لمن بدأ تجربته). الأوقات تُعرض بتوقيت جهاز المستخدم أينما كان.
import { useEffect, useState } from 'react';
import { useI18n } from './I18nProvider';
import { getBrowserSupabase } from '../../lib/supabaseBrowser';

type Plan = { has_plan: boolean; plan?: string; period?: string; used?: number; cap?: number; resets_at?: string };
type Status = { has_trial: boolean; day?: number; finished?: boolean; used_today?: boolean; next_at?: string };

export default function TrialStatus({ refreshKey }: { refreshKey: string }) {
  const { t, lang } = useI18n();
  const [s, setS] = useState<Status | null>(null);
  const [pl, setPl] = useState<Plan | null>(null);

  useEffect(() => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    let off = false;
    sb.auth.getSession().then(({ data }) => {
      const tk = data.session?.access_token;
      if (!tk) return;
      fetch('/api/me', { headers: { Authorization: `Bearer ${tk}` }, cache: 'no-store' })
        .then((r) => (r.ok ? r.json() : null)).then((j) => { if (!off) setPl((j?.plan as Plan) ?? null); }).catch(() => null);
    });
    sb.rpc('my_trial_status').then(({ data, error }) => { if (!off && !error) setS(data as Status); });
    return () => { off = true; };
  }, [refreshKey]);

  if (pl?.has_plan) {
    const names: Record<string, string> = { individual: t('plans.individual'), small: t('plans.small'), medium: t('plans.medium'), large: t('plans.large') };
    const when = pl.resets_at ? new Date(pl.resets_at).toLocaleString(lang, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
    return (
      <p role="status" className="mb-4 rounded-lg border border-[rgba(110,231,183,0.4)] bg-[rgba(16,185,129,0.08)] px-3 py-2 text-xs leading-6 text-[#6ee7b7]">
        {t('plan.chip', { plan: names[pl.plan ?? ''] ?? '', used: pl.used ?? 0, cap: pl.cap ?? 0, time: when })}
      </p>
    );
  }
  if (!s?.has_trial) return null;
  const time = s.next_at ? new Date(s.next_at).toLocaleString(lang, { weekday: 'short', hour: '2-digit', minute: '2-digit' }) : '';
  const text = s.finished
    ? t('trial.chip.ended')
    : t('trial.chip.active', { day: Math.min(s.day ?? 1, 3), state: s.used_today ? t('trial.state.used', { time }) : t('trial.state.available') });
  return (
    <p role="status" className="mb-4 rounded-lg border border-[rgba(224,180,90,0.35)] bg-[rgba(224,180,90,0.08)] px-3 py-2 text-xs leading-6 text-[#e0b45a]">{text}</p>
  );
}
