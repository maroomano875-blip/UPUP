// صفحة تعيين كلمة مرور جديدة (رابط الاستعادة يصل إليها من البريد)
import { dirOf } from '../../lib/i18n';
import { getLang } from '../../lib/i18n/server';
import FxShell from '../../ui/components/FxShell';
import ResetPassword from '../../ui/components/ResetPassword';

export const dynamic = 'force-dynamic';

export default async function ResetPasswordPage() {
  const lang = await getLang();
  return (
    <FxShell dir={dirOf(lang)}>
      <ResetPassword />
    </FxShell>
  );
}
