import Link from 'next/link';
import { PROFESSIONS, liveAgents } from '../data/catalog';
import { COUNTRIES, VOLATILE, VERIFIED_COUNTRIES, isVerified, distinctLanguages } from '../data/countries';
import { LAYERS } from '../data/layers';
import { loadStats } from '../lib/stats';
import AgentConsole from '../ui/components/AgentConsole';
import { t, dirOf } from '../lib/i18n';
import { getLang } from '../lib/i18n/server';
import { countryName, profName } from '../lib/i18n/names';
import { agentName, plannedName, profDesc, staticText } from '../lib/i18n/catalog';

export const dynamic = 'force-dynamic';

const stateStyle: Record<string, string> = {
  built: 'bg-[rgba(16,185,129,0.15)] text-[#6ee7b7] border-[rgba(16,185,129,0.3)]',
  partial: 'bg-[rgba(245,158,11,0.15)] text-[#fcd34d] border-[rgba(245,158,11,0.3)]',
  planned: 'bg-[rgba(100,116,139,0.15)] text-[#cbd5e1] border-[rgba(100,116,139,0.3)]',
};

function fmt(v: unknown) { return v == null ? '' : typeof v === 'string' ? v : JSON.stringify(v); }

export default async function Home() {
  const lang = await getLang();
  const T = (k: Parameters<typeof t>[1], v?: Record<string, string | number>) => t(lang, k, v);
  const stats = await loadStats();
  const agents = liveAgents();
  const liveProf = PROFESSIONS.filter((p) => p.status === 'live').length;
  const cards = [
    { label: T('home.card.prof'), value: PROFESSIONS.length, sub: T('home.card.profSub', { n: liveProf }) },
    { label: T('home.card.agents'), value: agents.length, sub: T('home.card.agentsSub') },
    { label: T('home.card.countries'), value: COUNTRIES.length, sub: T('home.card.countriesSub', { v: VERIFIED_COUNTRIES.length }) },
    { label: T('home.card.requests'), value: stats.requests ?? '—', sub: stats.connected ? T('home.card.dbOn') : T('home.card.dbOff') },
  ];

  return (
    <main className="min-h-screen bg-[#020617] text-[#f1f5f9]" dir={dirOf(lang)}>
      <header className="bg-gradient-to-br from-[#0f172a] via-[#0f172a] to-[#1e1b4b] border-b border-[rgba(255,255,255,0.1)]">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
          <p className="text-sm text-[#a5b4fc]">UPAP · Universal Professions AI Platform</p>
          <h1 className="mt-2 text-3xl sm:text-5xl font-bold leading-tight">{T('home.title')}</h1>
          <p className="mt-3 max-w-2xl text-[#cbd5e1] leading-8">
            {T('home.intro')}
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            {(['home.tag1', 'home.tag2', 'home.tag3', 'home.tag4', 'home.tag5'] as const).map((k) => (
              <span key={k} className="rounded-full border border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.05)] px-3 py-1">{T(k)}</span>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8 space-y-12">
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          {[[PROFESSIONS.length, T('home.big.prof')], [COUNTRIES.length, T('home.big.country')], [distinctLanguages(), T('home.big.lang')], ['$0', T('home.big.capital')]].map(([v, l]) => (
            <div key={String(l)} className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.7)] py-4">
              <div className="text-3xl font-bold text-[#e0b45a]">{v}</div><div className="text-xs text-[#cbd5e1] mt-1">{l}</div>
            </div>
          ))}
        </section>
        <AgentConsole lang={lang} />

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {cards.map((c) => (
            <div key={c.label} className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.7)] p-4">
              <div className="text-xs text-[#94a3b8]">{c.label}</div>
              <div className="mt-1 text-3xl font-bold">{c.value}</div>
              <div className="mt-1 text-xs text-[#64748b]">{c.sub}</div>
            </div>
          ))}
        </section>

        <section>
          <h2 className="text-xl font-bold mb-1">{T('home.pick.title')}</h2>
          <p className="text-sm text-[#94a3b8] mb-4">{T('home.pick.sub')}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {PROFESSIONS.map((p) => (
              <Link key={p.slug} href={`/professions/${p.slug}`}
                className="group rounded-xl border border-[rgba(255,255,255,0.1)] p-4 transition hover:-translate-y-0.5"
                style={{ borderTop: `3px solid ${p.color}`, background: `linear-gradient(160deg, ${p.color}26 0%, #0f172acc 70%)` }}>
                <div className="grid h-11 w-11 place-items-center rounded-xl text-2xl" style={{ background: `${p.color}33`, boxShadow: `inset 0 0 0 1px ${p.color}66` }}>{p.icon}</div>
                <div className="mt-3 font-semibold" style={{ color: p.color }}>{profName(p, lang)}</div>
                <div className="text-xs text-[#94a3b8] mt-1 line-clamp-2">{profDesc(p, lang)}</div>
                <span className="mt-3 inline-block rounded-full border px-2 py-0.5 text-[11px]" style={p.status === 'live' ? { borderColor: `${p.color}80`, background: `${p.color}26`, color: p.color } : { borderColor: 'rgba(148,163,184,0.3)', color: '#94a3b8' }}>
                  {p.status === 'live' ? T('home.pick.live', { n: p.agents.length }) : T('common.soon')}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">{T('home.reg.title')}</h2>
          <div className="overflow-x-auto rounded-xl border border-[rgba(255,255,255,0.1)]">
            <table className="w-full text-sm">
              <thead className="bg-[#0f172a] text-[#94a3b8]">
                <tr><th className="p-3 text-start">{T('home.reg.agent')}</th><th className="p-3 text-start">{T('home.reg.prof')}</th><th className="p-3 text-start">{T('home.reg.review')}</th><th className="p-3 text-start">{T('home.reg.state')}</th></tr>
              </thead>
              <tbody>
                {agents.map((a) => (
                  <tr key={a.slug} className="border-t border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.5)]">
                    <td className="p-3"><Link href={a.href} className="font-medium text-[#a5b4fc] hover:underline">{agentName(a, lang)}</Link></td>
                    <td className="p-3">{a.profession.icon} {profName(a.profession, lang)}</td>
                    <td className="p-3 text-[#cbd5e1]">{a.needsApproval ? T('home.reg.review2h') : T('home.reg.review2')}</td>
                    <td className="p-3"><span className={`rounded-full border px-2 py-0.5 text-xs ${stateStyle.built}`}>{T('common.running')}</span></td>
                  </tr>
                ))}
                {PROFESSIONS.filter((p) => p.status === 'planned').slice(0, 4).map((p) => (
                  <tr key={p.slug} className="border-t border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.3)] text-[#94a3b8]">
                    <td className="p-3">{plannedName(p.planned_agents[0], lang)}</td><td className="p-3">{p.icon} {profName(p, lang)}</td><td className="p-3">—</td>
                    <td className="p-3"><span className={`rounded-full border px-2 py-0.5 text-xs ${stateStyle.planned}`}>{T('common.planned')}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">{T('home.layers.title')}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {LAYERS.map((l) => (
              <div key={l.id} className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.7)] p-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[#a5b4fc]">{l.id}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] ${stateStyle[l.state]}`}>{T(`layer.${l.state}` as 'layer.built')}</span>
                </div>
                <div className="mt-2 font-semibold">{T(`layer.${l.id}.name` as 'layer.L0.name')}</div>
                <p className="mt-1 text-sm text-[#94a3b8] leading-6">{T(`layer.${l.id}.desc` as 'layer.L0.desc')}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-1">{T('home.comp.title')}</h2>
          <p className="text-sm text-[#94a3b8] mb-4">{T('home.comp.sub')}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {COUNTRIES.map((c) => (
              <div key={c.code} className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.7)] p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{c.flag} {countryName(c.code, lang, c.name_ar)}</span>
                  <span className="rounded-md bg-[rgba(99,102,241,0.2)] px-2 py-0.5 text-xs text-[#c7d2fe]">{c.currency}</span>
                </div>
                <div className="mt-2 text-xs text-[#94a3b8]">{staticText(c.tax, lang)} · {c.dir.toUpperCase()} · {c.tz}</div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {c.regs.map((r) => <span key={r} className="rounded bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] px-1.5 py-0.5 text-[11px] text-[#cbd5e1]">{staticText(r, lang)}</span>)}
                </div>
                <span className={`mt-2 inline-block rounded-full border px-2 py-0.5 text-[11px] ${isVerified(c.code) ? stateStyle.built : stateStyle.planned}`}>{isVerified(c.code) ? T('home.comp.verified') : T('home.comp.general')}</span>
                {c.restricted && <div className="mt-2 rounded bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.3)] px-2 py-1 text-xs text-[#fcd34d]">{T('home.comp.restricted')}</div>}
                {VOLATILE.includes(c.currency) && <div className="mt-1 text-[11px] text-[#64748b]">{T('home.comp.volatile')}</div>}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">{T('home.audit.title')}</h2>
          <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.7)] divide-y divide-[rgba(255,255,255,0.1)]">
            {stats.recent.length === 0 && <div className="p-4 text-sm text-[#94a3b8]">{T('home.audit.empty')}</div>}
            {stats.recent.map((e, i) => (
              <div key={i} className="p-3 text-sm flex flex-wrap gap-x-4 gap-y-1">
                <span className="text-[#a5b4fc]">{fmt(e.event ?? e.action ?? e.type ?? e.status)}</span>
                <span className="text-[#94a3b8]">{fmt(e.agent_slug ?? e.agent ?? e.agent_id)}</span>
                <span className="text-[#64748b] text-xs" dir="ltr">{fmt(e.created_at)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
      <footer className="border-t border-[rgba(255,255,255,0.1)] py-6 text-center text-xs text-[#64748b]">{T('home.footer')}</footer>
    </main>
  );
}
