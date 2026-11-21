// صفحة «مكتبي» (إدارة المكتب والأعضاء) بلغة الواجهة الحالية
import { dirOf } from '../../lib/i18n';
import { getLang } from '../../lib/i18n/server';
import OfficePanel from '../../ui/components/OfficePanel';

export const dynamic = 'force-dynamic';

export default async function OfficePage() {
  const lang = await getLang();
  return (
    <main className="min-h-screen bg-[#020617] px-5 py-16 text-[#f1f5f9]" dir={dirOf(lang)}>
      <OfficePanel />
    </main>
  );
}
