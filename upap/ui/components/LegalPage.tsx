// عرض صفحة قانونية (خادم): العنوان، تاريخ التحديث، الأقسام، وبريد التواصل، وروابط الصفحات الأخرى.
import Link from 'next/link';
import { dirOf, t } from '../../lib/i18n';
import { getLang } from '../../lib/i18n/server';
import { LEGAL, LEGAL_UPDATED, contactEmail, type LegalKind } from '../../lib/legal';

const KINDS: LegalKind[] = ['privacy', 'terms', 'refunds'];

export default async function LegalPage({ kind }: { kind: LegalKind }) {
  const lang = await getLang();
  const doc = LEGAL[lang][kind];
  const mail = contactEmail();
  return (
    <main className="min-h-screen bg-[#020617] text-[#f1f5f9]" dir={dirOf(lang)}>
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[#a5b4fc]">
          <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="rtl:rotate-180"><path d="M15 6l-6 6 6 6" /></svg>
          {t(lang, 'common.home')}
        </Link>
        <header>
          <h1 className="text-3xl font-bold">{doc.title}</h1>
          <p className="mt-1 text-xs text-[#94a3b8]">{doc.updated}: {LEGAL_UPDATED}</p>
        </header>
        {doc.sections.map((s) => (
          <section key={s.h} className="space-y-2">
            <h2 className="text-lg font-bold text-[#e0b45a]">{s.h}</h2>
            {s.p.map((x) => <p key={x} className="text-sm leading-7 text-[#e2e8f0]">{x}</p>)}
          </section>
        ))}
        <section className="rounded-xl border border-[rgba(255,255,255,0.12)] bg-[rgba(15,23,42,0.7)] p-4 text-sm">
          <h2 className="font-bold text-[#e0b45a]">{t(lang, 'legal.contact')}</h2>
          {mail ? <a href={`mailto:${mail}`} dir="ltr" className="mt-1 inline-block text-[#a5b4fc] underline">{mail}</a> : <p className="mt-1 text-[#94a3b8]">{t(lang, 'legal.contactSoon')}</p>}
        </section>
        <nav className="flex flex-wrap gap-4 border-t border-[rgba(255,255,255,0.1)] pt-4 text-xs text-[#a5b4fc]">
          {KINDS.filter((k) => k !== kind).map((k) => <Link key={k} href={`/${k}`}>{LEGAL[lang][k].title}</Link>)}
        </nav>
      </div>
    </main>
  );
}
