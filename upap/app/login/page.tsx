// صفحة الدخول (تعرض لوحة العميل داخل غلاف متحرك بلغة الواجهة الحالية)
import { dirOf } from '../../lib/i18n';
import { getLang } from '../../lib/i18n/server';
import AuthPanel from '../../ui/components/AuthPanel';
import LegalLinks from '../../ui/components/LegalLinks';
import FxShell from '../../ui/components/FxShell';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const lang = await getLang();
  return (
    <FxShell dir={dirOf(lang)}>
      <AuthPanel />
      <div className="mt-4"><LegalLinks agree /></div>
    </FxShell>
  );
}
