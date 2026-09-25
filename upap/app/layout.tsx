import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UPAP — نظام تشغيل المهن",
  description: "Universal Professions AI Platform — ذكاء اصطناعي لكل مهنة، في كل دولة",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
