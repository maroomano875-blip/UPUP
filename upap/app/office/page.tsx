// صفحة «مكتبي» (واجهة واحدة لإدارة المكتب والأعضاء) بلغة الواجهة الحالية
import { dirOf } from '../../lib/i18n';
import { getLang } from '../../lib/i18n/server';
import OfficePanel from '../../ui/components/OfficePanel';
import FxShell from '../../ui/components/FxShell';

export const dynamic = 'force-dynamic';

export default async function OfficePage() {
  const lang = await getLang();
  return (
    <FxShell dir={dirOf(lang)}>
      <OfficePanel />
    </FxShell>
  );
}
