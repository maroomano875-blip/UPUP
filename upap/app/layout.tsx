import type { Metadata } from "next";
import "./globals.css";
import { dirOf, t } from "../lib/i18n";
import { getLang } from "../lib/i18n/server";
import { I18nProvider } from "../ui/components/I18nProvider";
import AuthBadge from "../ui/components/AuthBadge";
import { ToastProvider } from "../ui/components/ToastProvider";
import TrialNotices from "../ui/components/TrialNotices";
import SubscriptionNotices from "../ui/components/SubscriptionNotices";

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
            <AuthBadge />
            <TrialNotices />
            <SubscriptionNotices />
          </ToastProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
