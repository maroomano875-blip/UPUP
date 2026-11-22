// صفحة الاشتراكات (الخطط وحدود الأعضاء). الدفع يُضاف في المرحلة 5.
import { dirOf } from '../../lib/i18n';
import { getLang } from '../../lib/i18n/server';
import PlansView from '../../ui/components/PlansView';
import FxShell from '../../ui/components/FxShell';

export const dynamic = 'force-dynamic';

export default async function SubscribePage() {
  const lang = await getLang();
  return (
    <FxShell dir={dirOf(lang)}>
      <PlansView />
    </FxShell>
  );
}
