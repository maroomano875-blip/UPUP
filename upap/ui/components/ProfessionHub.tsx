'use client';
import Link from 'next/link';
import { useState } from 'react';
import type { Profession } from '../../data/catalog';
import { COUNTRIES, LANGUAGES, VOLATILE, complianceChecks, fmtMoney, getCountry } from '../../data/countries';

const sevStyle = {
  blocker: 'border-[rgba(239,68,68,0.4)] bg-[rgba(239,68,68,0.1)] text-[#fca5a5]',
  warning: 'border-[rgba(245,158,11,0.4)] bg-[rgba(245,158,11,0.1)] text-[#fcd34d]',
  info: 'border-[rgba(14,165,233,0.3)] bg-[rgba(14,165,233,0.1)] text-[#7dd3fc]',
} as const;
const sevLabel = { blocker: 'مانع', warning: 'تنبيه', info: 'معلومة' } as const;

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.7)] p-5">
      <h2 className="flex items-center gap-3 font-semibold">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[rgba(255,255,255,0.1)] text-sm">{n}</span>{title}
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
  const field = 'w-full rounded-lg border border-[rgba(255,255,255,0.15)] bg-[#020617] px-3 py-2.5 text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-[#818cf8]';

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        <Step n={1} title="الدولة">
          <select className={field} value={code} onChange={(e) => { setCode(e.target.value); setLang(getCountry(e.target.value).languages[0]); }}>
            {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.name_ar} — {c.currency}</option>)}
          </select>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {country.regs.map((r) => <span key={r} className="rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-2 py-0.5 text-xs text-[#cbd5e1]">{r}</span>)}
            {country.restricted && <span className="rounded border border-[rgba(245,158,11,0.4)] bg-[rgba(245,158,11,0.1)] px-2 py-0.5 text-xs text-[#fcd34d]">قيود دفع ← USDT</span>}
          </div>
          <p className="mt-2 text-xs text-[#94a3b8]">{country.tax}</p>
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
                <div key={a.slug} className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(2,6,23,0.6)] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-semibold">{a.name_ar}</div>
                    <span className="rounded-full border border-[rgba(16,185,129,0.3)] bg-[rgba(16,185,129,0.15)] px-2 py-0.5 text-xs text-[#6ee7b7]">يعمل</span>
                  </div>
                  <p className="mt-1 text-sm text-[#94a3b8] leading-6">{a.desc_ar}</p>
                  <Link href={a.href} className="mt-3 inline-block rounded-lg px-4 py-2 text-sm font-semibold text-[#ffffff]" style={{ background: p.color }}>
                    افتح الوكيل: رفع الملف والملاحظات
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-[rgba(255,255,255,0.2)] p-4 text-sm text-[#cbd5e1] leading-7">
              لا يوجد وكيل جاهز لهذه المهنة بعد. الوكلاء المخططة:
              <ul className="mt-2 list-disc pr-5 text-[#94a3b8]">{p.planned_agents.map((x) => <li key={x}>{x}</li>)}</ul>
              <button disabled className="mt-3 cursor-not-allowed rounded-lg bg-[rgba(255,255,255,0.1)] px-4 py-2 text-sm text-[#64748b]">ابدأ التحليل (غير متاح بعد)</button>
            </div>
          )}
        </Step>

        {checks.length > 0 && (
          <section className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.7)] p-5">
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
        <section className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.7)] p-5">
          <h3 className="font-semibold">تنسيق العملة</h3>
          <div className="mt-3 text-2xl font-bold" dir="ltr">{fmtMoney(1234567.89, country)}</div>
          <div className="mt-1 text-xs text-[#94a3b8]">{country.currency} · {country.locale} · {country.tz}</div>
          {VOLATILE.includes(country.currency) && <p className="mt-3 rounded bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.3)] p-2 text-xs text-[#fcd34d]">عملة متقلبة: المبالغ تُعرض كما وردت في المستند دون تحويل.</p>}
        </section>
        <section className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.7)] p-5 text-sm text-[#cbd5e1] leading-7">
          <h3 className="font-semibold mb-2">ضمانات كل طلب</h3>
          <ul className="list-disc pr-5 space-y-1 text-[#94a3b8]">
            <li>مراجعة بوكيل ثانٍ</li><li>تسجيل في سجل التدقيق</li><li>عزل بيانات عميلك</li><li>تصحيحاتك تحسّن النتائج لاحقاً</li>
          </ul>
        </section>
      </aside>
    </div>
  );
}
