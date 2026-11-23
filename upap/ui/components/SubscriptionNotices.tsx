'use client';
// مراقب إشعارات الاشتراك: يقرأ الإشعارات غير المقروءة من قاعدة البيانات ويعرضها في أي صفحة،
// فلا يعتمد ظهور تأكيد الدفع على بقاء نافذة الدفع مفتوحة.
import { useCallback, useEffect, useRef } from 'react';
import { useI18n } from './I18nProvider';
import { useToast } from './ToastProvider';
import { getBrowserSupabase } from '../../lib/supabaseBrowser';

type Row = { id: string; kind: string; meta: { plan?: string; expires_at?: string } | null };
const EVERY_MS = 15000;

export default function SubscriptionNotices() {
  const { t, lang } = useI18n();
  const { push } = useToast();
  const seen = useRef<Set<string>>(new Set());
  const busy = useRef(false);

  const check = useCallback(async () => {
    const sb = getBrowserSupabase();
    if (!sb || busy.current) return;
    busy.current = true;
    try {
      const { data: s } = await sb.auth.getSession();
      if (!s.session) return;
      const { data } = await sb.from('notifications').select('id,kind,meta').is('read_at', null).eq('kind', 'subscribed').order('created_at', { ascending: true }).limit(5);
      const fresh = ((data as Row[] | null) ?? []).filter((r) => !seen.current.has(r.id));
      if (!fresh.length) return;
      fresh.forEach((r) => {
        seen.current.add(r.id);
        const d = r.meta?.expires_at ? new Date(r.meta.expires_at).toLocaleDateString() : '';
        const names: Record<string, string> = { individual: t('plans.individual'), small: t('plans.small'), medium: t('plans.medium'), large: t('plans.large') };
        const plan = r.meta?.plan ? names[r.meta.plan] ?? '' : '';
        push({ kind: 'success', title: t('pay.done.title'), body: [plan, d ? t('pay.done.body', { d }) : ''].filter(Boolean).join(' — '), ttl: 10000 });
      });
      window.dispatchEvent(new Event('upap:subscribed'));
      // بريد التأكيد يُرسل من الخادم مرة واحدة لكل إشعار
      fetch('/api/billing/email-receipt', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${s.session.access_token}` }, body: JSON.stringify({ ids: fresh.map((r) => r.id), lang }) }).catch(() => null);
      await sb.rpc('mark_notifications_read');
    } catch { /* الفشل لا يوقف الصفحة */ } finally { busy.current = false; }
  }, [push, t, lang]);

  useEffect(() => {
    void check();
    const id = window.setInterval(check, EVERY_MS);
    const onBack = () => { if (document.visibilityState === 'visible') void check(); };
    document.addEventListener('visibilitychange', onBack);
    window.addEventListener('focus', onBack);
    return () => { window.clearInterval(id); document.removeEventListener('visibilitychange', onBack); window.removeEventListener('focus', onBack); };
  }, [check]);

  return null;
}
