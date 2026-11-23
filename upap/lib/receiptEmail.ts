// نص بريد تأكيد الاشتراك بثلاث لغات.
import type { Mail } from './mailer';

type Lang = 'ar' | 'en' | 'fr';
const PLAN: Record<Lang, Record<string, string>> = {
  ar: { individual: 'فردي', small: 'الصغيرة', medium: 'المتوسطة', large: 'الكبيرة' },
  en: { individual: 'Individual', small: 'Small office', medium: 'Medium office', large: 'Large office' },
  fr: { individual: 'Individuel', small: 'Petit bureau', medium: 'Bureau moyen', large: 'Grand bureau' },
};
const PERIOD: Record<Lang, Record<string, string>> = {
  ar: { weekly: 'أسبوعي', monthly: 'شهري', yearly: 'سنوي' },
  en: { weekly: 'weekly', monthly: 'monthly', yearly: 'yearly' },
  fr: { weekly: 'hebdomadaire', monthly: 'mensuel', yearly: 'annuel' },
};
const TXT: Record<Lang, (p: string, per: string, d: string) => { s: string; h: string; b: string; f: string }> = {
  ar: (p, per, d) => ({ s: 'تم تفعيل اشتراكك في UPAP', h: 'تم الاشتراك بنجاح 🎉', b: `خطتك: ${p} (${per}). اشتراكك فعّال حتى ${d}.`, f: 'شكراً لثقتك. هذه رسالة تلقائية.' }),
  en: (p, per, d) => ({ s: 'Your UPAP subscription is active', h: 'Subscription confirmed 🎉', b: `Your plan: ${p} (${per}). Active until ${d}.`, f: 'Thank you. This is an automated message.' }),
  fr: (p, per, d) => ({ s: 'Votre abonnement UPAP est actif', h: 'Abonnement confirmé 🎉', b: `Votre forfait : ${p} (${per}). Actif jusqu'au ${d}.`, f: 'Merci. Message automatique.' }),
};

export const safeLang = (v: unknown): Lang => (v === 'en' || v === 'fr' ? v : 'ar');

export function receiptMail(to: string, lang: Lang, plan: string, period: string, expiresIso: string): Mail {
  const d = new Date(expiresIso);
  const date = Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
  const x = TXT[lang](PLAN[lang][plan] ?? plan, PERIOD[lang][period] ?? period, date);
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const html = `<div dir="${dir}" style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;background:#0f172a;color:#e2e8f0;border-radius:12px"><h2 style="color:#e0b45a;margin:0 0 12px">${x.h}</h2><p style="font-size:16px;line-height:1.8">${x.b}</p><p style="font-size:12px;color:#94a3b8">${x.f}</p></div>`;
  return { to, subject: x.s, text: `${x.h}\n${x.b}\n${x.f}`, html };
}
