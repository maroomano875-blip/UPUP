import type { Metadata } from "next";
import "./globals.css";
import { dirOf, t } from "../lib/i18n";
import { getLang } from "../lib/i18n/server";
import { I18nProvider } from "../ui/components/I18nProvider";
import UiLangSwitch from "../ui/components/UiLangSwitch";

export function generateMetadata(): Metadata {
  const lang = getLang();
  return { title: t(lang, 'app.title'), description: t(lang, 'app.desc') };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = getLang();
  return (
    <html lang={lang} dir={dirOf(lang)}>
      <body>
        <I18nProvider lang={lang}>
          {children}
          <UiLangSwitch />
        </I18nProvider>
      </body>
    </html>
  );
}
