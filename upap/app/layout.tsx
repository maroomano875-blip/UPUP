import type { Metadata } from "next";
import "./globals.css";
import { dirOf, t } from "../lib/i18n";
import { getLang } from "../lib/i18n/server";
import { I18nProvider } from "../ui/components/I18nProvider";
import UiLangSwitch from "../ui/components/UiLangSwitch";
import AuthBadge from "../ui/components/AuthBadge";
import { ToastProvider } from "../ui/components/ToastProvider";
import TrialNotices from "../ui/components/TrialNotices";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return { title: t(lang, 'app.title'), description: t(lang, 'app.desc') };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  return (
    <html lang={lang} dir={dirOf(lang)}>
      <body>
        <I18nProvider lang={lang}>
          <ToastProvider>
            {children}
            <UiLangSwitch />
            <AuthBadge />
            <TrialNotices />
          </ToastProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
