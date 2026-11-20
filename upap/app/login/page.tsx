// صفحة الدخول (تعرض لوحة العميل داخل غلاف الصفحة بلغة الواجهة الحالية)
import { dirOf } from '../../lib/i18n';
import { getLang } from '../../lib/i18n/server';
import AuthPanel from '../../ui/components/AuthPanel';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const lang = await getLang();
  return (
    <main className="flex min-h-screen items-center bg-[#020617] px-5 py-16 text-[#f1f5f9]" dir={dirOf(lang)}>
      <AuthPanel />
    </main>
  );
}
