import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PROFESSIONS, getProfession } from '../../../data/catalog';
import { dirOf, t } from '../../../lib/i18n';
import { getLang } from '../../../lib/i18n/server';
import { profName, profDesc } from '../../../lib/i18n/catalog';
import ProfessionHub from '../../../ui/components/ProfessionHub';

export const dynamic = 'force-dynamic';
export function generateStaticParams() { return PROFESSIONS.map((p) => ({ profession: p.slug })); }

export default async function ProfessionPage(props: { params: Promise<{ profession: string }>; searchParams: Promise<{ agent?: string }> }) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const p = getProfession(params.profession);
  if (!p) notFound();
  const lang = await getLang();
  return (
    <main style={{ backgroundImage: `radial-gradient(900px 400px at 50% -100px, ${p.color}22, transparent)` }} className="min-h-screen bg-[#020617] text-[#f1f5f9]" dir={dirOf(lang)}>
      <header className="border-b border-[rgba(255,255,255,0.1)]" style={{ background: `linear-gradient(135deg, #0f172a 0%, ${p.color}66 140%)` }}>
        <div className="mx-auto max-w-6xl px-5 py-8">
          <Link href="/" className="text-sm text-[#cbd5e1] hover:underline">{t(lang, 'common.home')}</Link>
          <h1 className="mt-3 text-3xl font-bold" style={{ color: p.color }}>{p.icon} {profName(p, lang)}</h1>
          <p className="mt-2 text-[#cbd5e1]">{profDesc(p, lang)}</p>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-8"><ProfessionHub p={p} initialAgent={searchParams.agent} /></div>
    </main>
  );
}
