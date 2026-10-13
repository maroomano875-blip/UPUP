import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PROFESSIONS, getProfession } from '../../../data/catalog';
import ProfessionHub from '../../../ui/components/ProfessionHub';

export function generateStaticParams() { return PROFESSIONS.map((p) => ({ profession: p.slug })); }

export default function ProfessionPage({ params }: { params: { profession: string } }) {
  const p = getProfession(params.profession);
  if (!p) notFound();
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100" dir="rtl">
      <header className="border-b border-white/10" style={{ background: `linear-gradient(135deg, #0f172a 0%, ${p.color}55 160%)` }}>
        <div className="mx-auto max-w-6xl px-5 py-8">
          <Link href="/" className="text-sm text-slate-300 hover:underline">الرئيسية</Link>
          <h1 className="mt-3 text-3xl font-bold">{p.icon} {p.name_ar}</h1>
          <p className="mt-2 text-slate-300">{p.desc_ar}</p>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-8"><ProfessionHub p={p} /></div>
    </main>
  );
}
