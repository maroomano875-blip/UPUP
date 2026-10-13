'use client';
import Link from 'next/link';
import { useState } from 'react';
import type { Profession } from '../../data/catalog';
import { COUNTRIES, LANGUAGES, VOLATILE, complianceChecks, fmtMoney, getCountry } from '../../data/countries';

const sevStyle = {
  blocker: 'border-red-500/40 bg-red-500/10 text-red-300',
  warning: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  info: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
} as const;
const sevLabel = { blocker: 'مانع', warning: 'تنبيه', info: 'معلومة' } as const;

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-white/10 bg-slate-900/70 p-5">
      <h2 className="flex items-center gap-3 font-semibold">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-white/10 text-sm">{n}</span>{title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function ProfessionHub({ p }: { p: Profession }) {
  const [code, setCode] = useState('SY');
  const country = getCountry(code);
  const [lang, setLang] = useState(country.languages[0]);
  const checks = complianceChecks(country, p.slug);
  const langs = Array.from(new Set([...country.languages, 'ar', 'en-US']));
  const field = 'w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400';

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        <Step n={1} title="الدولة">
          <select className={field} value={code} onChange={(e) => { setCode(e.target.value); setLang(getCountry(e.target.value).languages[0]); }}>
            {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.name_ar} — {c.currency}</option>)}
          </select>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {country.regs.map((r) => <span key={r} className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-300">{r}</span>)}
            {country.restricted && <span className="rounded border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-300">قيود دفع ← USDT</span>}
          </div>
          <p className="mt-2 text-xs text-slate-400">{country.tax}</p>
        </Step>

        <Step n={2} title="اللغة">
          <select className={field} value={lang} onChange={(e) => setLang(e.target.value)}>
            {langs.map((l) => <option key={l} value={l}>{LANGUAGES[l] ?? l}</option>)}
          </select>
        </Step>

        <Step n={3} title="الوكيل">
          {p.agents.length > 0 ? (
            <div className="space-y-3">
              {p.agents.map((a) => (
                <div key={a.slug} className="rounded-lg border border-white/10 bg-slate-950/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-semibold">{a.name_ar}</div>
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-300">يعمل</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-400 leading-6">{a.desc_ar}</p>
                  <Link href={a.href} className="mt-3 inline-block rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ background: p.color }}>
                    افتح الوكيل: رفع الملف والملاحظات
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-white/20 p-4 text-sm text-slate-300 leading-7">
              لا يوجد وكيل جاهز لهذه المهنة بعد. الوكلاء المخططة:
              <ul className="mt-2 list-disc pr-5 text-slate-400">{p.planned_agents.map((x) => <li key={x}>{x}</li>)}</ul>
              <button disabled className="mt-3 cursor-not-allowed rounded-lg bg-white/10 px-4 py-2 text-sm text-slate-500">ابدأ التحليل (غير متاح بعد)</button>
            </div>
          )}
        </Step>

        {checks.length > 0 && (
          <section className="rounded-xl border border-white/10 bg-slate-900/70 p-5">
            <h2 className="font-semibold">فحوصات الامتثال: {country.name_ar} × {p.name_ar}</h2>
            <ul className="mt-3 space-y-2">
              {checks.map((c, i) => (
                <li key={i} className={`rounded-lg border px-3 py-2 text-sm ${sevStyle[c.severity]}`}>
                  <b className="ml-2">{sevLabel[c.severity]}</b>{c.text}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <aside className="space-y-5">
        <section className="rounded-xl border border-white/10 bg-slate-900/70 p-5">
          <h3 className="font-semibold">تنسيق العملة</h3>
          <div className="mt-3 text-2xl font-bold" dir="ltr">{fmtMoney(1234567.89, country)}</div>
          <div className="mt-1 text-xs text-slate-400">{country.currency} · {country.locale} · {country.tz}</div>
          {VOLATILE.includes(country.currency) && <p className="mt-3 rounded bg-amber-500/10 border border-amber-500/30 p-2 text-xs text-amber-300">عملة متقلبة: المبالغ تُعرض كما وردت في المستند دون تحويل.</p>}
        </section>
        <section className="rounded-xl border border-white/10 bg-slate-900/70 p-5 text-sm text-slate-300 leading-7">
          <h3 className="font-semibold mb-2">ضمانات كل طلب</h3>
          <ul className="list-disc pr-5 space-y-1 text-slate-400">
            <li>مراجعة بوكيل ثانٍ</li><li>تسجيل في سجل التدقيق</li><li>عزل بيانات عميلك</li><li>تصحيحاتك تحسّن النتائج لاحقاً</li>
          </ul>
        </section>
      </aside>
    </div>
  );
}
