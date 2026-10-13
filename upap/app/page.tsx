import Link from 'next/link';
import { PROFESSIONS, liveAgents } from '../data/catalog';
import { COUNTRIES, VOLATILE } from '../data/countries';
import { LAYERS } from '../data/layers';
import { loadStats } from '../lib/stats';

export const dynamic = 'force-dynamic';

const stateStyle: Record<string, string> = {
  built: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  partial: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  planned: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
};
const stateLabel: Record<string, string> = { built: 'جاهزة', partial: 'جزئية', planned: 'مخططة' };

function fmt(v: unknown) { return v == null ? '' : typeof v === 'string' ? v : JSON.stringify(v); }

export default async function Home() {
  const stats = await loadStats();
  const agents = liveAgents();
  const liveProf = PROFESSIONS.filter((p) => p.status === 'live').length;
  const cards = [
    { label: 'مهن مستهدفة', value: PROFESSIONS.length, sub: `${liveProf} تعمل الآن` },
    { label: 'وكلاء يعملون', value: agents.length, sub: 'مراجعة مزدوجة لكل مخرج' },
    { label: 'دول مدعومة', value: COUNTRIES.length, sub: `${COUNTRIES.filter((c) => c.restricted).length} بقيود دفع → USDT` },
    { label: 'طلبات معالجة', value: stats.requests ?? '—', sub: stats.connected ? 'من قاعدة البيانات' : 'قاعدة البيانات غير متصلة' },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100" dir="rtl">
      <header className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 border-b border-white/10">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
          <p className="text-sm text-indigo-300">UPAP · Universal Professions AI Platform</p>
          <h1 className="mt-2 text-3xl sm:text-5xl font-bold leading-tight">نظام تشغيل المهن</h1>
          <p className="mt-3 max-w-2xl text-slate-300 leading-8">
            منصة واحدة، وكلاء ذكاء اصطناعي لكل مهنة وكل بلد. كل مخرج يمر على وكيل مراجعة ثانٍ، ويُسجَّل في سجل تدقيق، ولا تختلط بيانات عميل بآخر.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            {['مراجعة مزدوجة', 'سجل تدقيق', 'عزل لكل عميل', 'دفع USDT', 'امتثال لكل دولة'].map((t) => (
              <span key={t} className="rounded-full border border-white/15 bg-white/5 px-3 py-1">{t}</span>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8 space-y-12">
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {cards.map((c) => (
            <div key={c.label} className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
              <div className="text-xs text-slate-400">{c.label}</div>
              <div className="mt-1 text-3xl font-bold">{c.value}</div>
              <div className="mt-1 text-xs text-slate-500">{c.sub}</div>
            </div>
          ))}
        </section>

        <section>
          <h2 className="text-xl font-bold mb-1">اختر مهنتك</h2>
          <p className="text-sm text-slate-400 mb-4">اضغط على مهنة ← تختار البلد واللغة ← ترفع الملف وتكتب ملاحظتك.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {PROFESSIONS.map((p) => (
              <Link key={p.slug} href={`/professions/${p.slug}`}
                className="group rounded-xl border border-white/10 bg-slate-900/70 p-4 transition hover:border-white/30 hover:bg-slate-900"
                style={{ borderTop: `3px solid ${p.color}` }}>
                <div className="text-2xl">{p.icon}</div>
                <div className="mt-2 font-semibold">{p.name_ar}</div>
                <div className="text-xs text-slate-400 mt-1 line-clamp-2">{p.desc_ar}</div>
                <span className={`mt-3 inline-block rounded-full border px-2 py-0.5 text-[11px] ${p.status === 'live' ? stateStyle.built : stateStyle.planned}`}>
                  {p.status === 'live' ? `يعمل · ${p.agents.length} وكيل` : 'قريباً'}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">سجل الوكلاء</h2>
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-slate-900 text-slate-400">
                <tr><th className="p-3 text-right">الوكيل</th><th className="p-3 text-right">المهنة</th><th className="p-3 text-right">المراجعة</th><th className="p-3 text-right">الحالة</th></tr>
              </thead>
              <tbody>
                {agents.map((a) => (
                  <tr key={a.slug} className="border-t border-white/10 bg-slate-900/50">
                    <td className="p-3"><Link href={a.href} className="font-medium text-indigo-300 hover:underline">{a.name_ar}</Link></td>
                    <td className="p-3">{a.profession.icon} {a.profession.name_ar}</td>
                    <td className="p-3 text-slate-300">{a.needsApproval ? 'وكيل ثانٍ + موافقة بشرية' : 'وكيل ثانٍ'}</td>
                    <td className="p-3"><span className={`rounded-full border px-2 py-0.5 text-xs ${stateStyle.built}`}>يعمل</span></td>
                  </tr>
                ))}
                {PROFESSIONS.filter((p) => p.status === 'planned').slice(0, 4).map((p) => (
                  <tr key={p.slug} className="border-t border-white/10 bg-slate-900/30 text-slate-400">
                    <td className="p-3">{p.planned_agents[0]}</td><td className="p-3">{p.icon} {p.name_ar}</td><td className="p-3">—</td>
                    <td className="p-3"><span className={`rounded-full border px-2 py-0.5 text-xs ${stateStyle.planned}`}>مخطط</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">الطبقات السبع</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {LAYERS.map((l) => (
              <div key={l.id} className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-indigo-300">{l.id}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] ${stateStyle[l.state]}`}>{stateLabel[l.state]}</span>
                </div>
                <div className="mt-2 font-semibold">{l.name}</div>
                <p className="mt-1 text-sm text-slate-400 leading-6">{l.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-1">الامتثال حسب الدولة</h2>
          <p className="text-sm text-slate-400 mb-4">العملة والنظام الضريبي واللوائح لكل بلد. البلدان بقيود دفع تُشترك عبر USDT.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {COUNTRIES.map((c) => (
              <div key={c.code} className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{c.flag} {c.name_ar}</span>
                  <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-xs text-indigo-200">{c.currency}</span>
                </div>
                <div className="mt-2 text-xs text-slate-400">{c.tax} · {c.dir.toUpperCase()} · {c.tz}</div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {c.regs.map((r) => <span key={r} className="rounded bg-white/5 border border-white/10 px-1.5 py-0.5 text-[11px] text-slate-300">{r}</span>)}
                </div>
                {c.restricted && <div className="mt-2 rounded bg-amber-500/10 border border-amber-500/30 px-2 py-1 text-xs text-amber-300">قيود دفع ← USDT</div>}
                {VOLATILE.includes(c.currency) && <div className="mt-1 text-[11px] text-slate-500">عملة متقلبة</div>}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">سجل التدقيق (آخر الأحداث)</h2>
          <div className="rounded-xl border border-white/10 bg-slate-900/70 divide-y divide-white/10">
            {stats.recent.length === 0 && <div className="p-4 text-sm text-slate-400">لا أحداث بعد. شغّل وكيلاً وسيظهر هنا كل ما جرى.</div>}
            {stats.recent.map((e, i) => (
              <div key={i} className="p-3 text-sm flex flex-wrap gap-x-4 gap-y-1">
                <span className="text-indigo-300">{fmt(e.event ?? e.action ?? e.type ?? e.status)}</span>
                <span className="text-slate-400">{fmt(e.agent_slug ?? e.agent ?? e.agent_id)}</span>
                <span className="text-slate-500 text-xs" dir="ltr">{fmt(e.created_at)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
      <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-500">UPAP — المخرجات مساعدة مهنية وتتطلب مراجعة مختص.</footer>
    </main>
  );
}
