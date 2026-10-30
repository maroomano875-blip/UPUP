'use client';
import { useEffect, useRef, useState } from 'react';
import type { Profession } from '../../data/catalog';
import { COUNTRIES, LANGUAGES, VOLATILE, complianceChecks, fmtMoney, getCountry } from '../../data/countries';

/* ---------- أنواع ونصوص ---------- */
type Tab = 'run' | 'log' | 'clients' | 'new';
interface Client { id: string; name: string; note: string }
interface Run { id: string; clientId: string; agent: string; file: string; confidence: number; at: string; summary: string }
interface Row { id: string; status: string; agent: string; country: string; confidence: number | null; created_at: string }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Out = Record<string, any>;

const sev = {
  blocker: 'border-[rgba(239,68,68,0.4)] bg-[rgba(239,68,68,0.1)] text-[#fca5a5]',
  warning: 'border-[rgba(245,158,11,0.4)] bg-[rgba(245,158,11,0.1)] text-[#fcd34d]',
  info: 'border-[rgba(14,165,233,0.3)] bg-[rgba(14,165,233,0.1)] text-[#7dd3fc]',
} as const;
const sevLabel = { blocker: 'مانع', warning: 'تنبيه', info: 'معلومة' } as const;
const risk: Record<string, string> = {
  low: 'border-[rgba(16,185,129,0.4)] bg-[rgba(16,185,129,0.1)] text-[#6ee7b7]',
  medium: 'border-[rgba(245,158,11,0.4)] bg-[rgba(245,158,11,0.1)] text-[#fcd34d]',
  high: 'border-[rgba(239,68,68,0.4)] bg-[rgba(239,68,68,0.1)] text-[#fca5a5]',
  critical: 'border-[rgba(239,68,68,0.8)] bg-[rgba(239,68,68,0.3)] text-[#ffffff]',
};
const riskAr: Record<string, string> = { low: 'منخفض', medium: 'متوسط', high: 'مرتفع', critical: 'حرج' };
const statusAr: Record<string, string> = { delivered: 'سُلّم', needs_human: 'يحتاج مراجعة', received: 'مستلم', parsing: 'قراءة', processing: 'تحليل', reviewing: 'مراجعة', failed: 'فشل' };

const KEY_C = 'upap_clients_v1';
const KEY_R = 'upap_runs_v1';
function load<T>(k: string): T[] { try { return JSON.parse(localStorage.getItem(k) || '[]'); } catch { return []; } }
function save(k: string, v: unknown) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* التخزين غير متاح */ } }

// ضغط الصور الكبيرة قبل الرفع (حد Vercel ≈ 4.5MB)
async function shrink(f: File): Promise<File> {
  if (!f.type.startsWith('image/') || f.size < 3_000_000) return f;
  try {
    const bmp = await createImageBitmap(f);
    const k = Math.min(1, 2000 / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
    c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
    const blob: Blob | null = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.85));
    return blob ? new File([blob], f.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' }) : f;
  } catch { return f; }
}

const fieldCls = 'w-full rounded-lg border border-[rgba(255,255,255,0.15)] bg-[#020617] px-3 py-2.5 text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-[#818cf8]';
const card = 'rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.7)] p-5';

function Step({ n, title, color, children }: { n: number; title: string; color: string; children: React.ReactNode }) {
  return (
    <section className={card} style={{ borderRight: `3px solid ${color}` }}>
      <h2 className="flex items-center gap-3 font-semibold">
        <span className="grid h-7 w-7 place-items-center rounded-full text-sm font-bold text-[#0f172a]" style={{ background: color }}>{n}</span>{title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/* ---------- عرض النتيجة ---------- */
function Result({ data, color }: { data: Out; color: string }) {
  const o: Out = data.output ?? {};
  const conf = Math.round((data.confidence_score ?? 0) * 100);
  const warnings: string[] = data.warnings ?? [];
  const isContract = Array.isArray(o.clauses);
  const rows: [string, string][] = isContract
    ? [['القانون الحاكم', o.governing_law], ['الاختصاص', o.jurisdiction], ['النوع', o.contract_type]]
    : [['المورد', o.vendor_name], ['رقم الفاتورة', o.invoice_number], ['التاريخ', o.invoice_date], ['الإجمالي', `${o.total ?? ''} ${o.currency ?? ''}`.trim()], ['التصنيف', o.category], ['القيد المقترح', o.suggested_journal_entry?.debit_account && `مدين: ${o.suggested_journal_entry.debit_account}`]]
      .map(([a, b]) => [a as string, b as string]);
  return (
    <div className="mt-5 space-y-3">
      {data.needs_human_review && <div className="rounded-lg border border-[rgba(245,158,11,0.4)] bg-[rgba(245,158,11,0.1)] px-4 py-3 text-sm text-[#fcd34d]">يحتاج هذا التحليل مراجعة مختص قبل أي قرار.</div>}
      <div className={card}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{isContract ? (o.contract_type || 'عقد') : `فاتورة ${o.vendor_name || ''}`}</h3>
          <span className="rounded-full px-3 py-0.5 text-xs font-bold text-[#0f172a]" style={{ background: color }}>{conf}% ثقة</span>
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          {rows.map(([k, v]) => (<div key={k}><dt className="text-xs text-[#94a3b8]">{k}</dt><dd className="text-[#f1f5f9]" dir="auto">{v || '—'}</dd></div>))}
        </dl>
        {o.executive_summary_ar && <p className="mt-3 text-sm leading-7 text-[#cbd5e1]">{o.executive_summary_ar}</p>}
      </div>
      {isContract && (o.clauses as Out[]).map((c, i) => (
        <div key={c.clause_id ?? i} className={`rounded-lg border px-4 py-3 ${risk[c.risk_level] ?? risk.medium}`}>
          <div className="flex justify-between text-sm font-semibold"><span>{c.type}</span><span>{riskAr[c.risk_level] ?? c.risk_level}</span></div>
          <p className="mt-1 text-xs leading-6">{c.risk_explanation}</p>
          <p className="mt-1 text-xs leading-6 opacity-90">التوصية: {c.recommendation}</p>
        </div>
      ))}
      {warnings.length > 0 && (
        <ul className="space-y-1">{warnings.map((w, i) => <li key={i} className={`rounded-lg border px-3 py-2 text-sm ${sev.warning}`}>{w}</li>)}</ul>
      )}
    </div>
  );
}

/* ---------- الصفحة الكاملة للمهنة ---------- */
export default function ProfessionHub({ p, initialAgent }: { p: Profession; initialAgent?: string }) {
  const [tab, setTab] = useState<Tab>('run');
  const [code, setCode] = useState('SY');
  const country = getCountry(code);
  const [lang, setLang] = useState(country.languages[0]);
  const [agent, setAgent] = useState(p.agents.find((a) => a.slug === initialAgent)?.slug ?? p.agents[0]?.slug ?? '');
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [clientId, setClientId] = useState('');
  const [st, setSt] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [res, setRes] = useState<Out | null>(null);
  const [err, setErr] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [connected, setConnected] = useState(true);
  const [cName, setCName] = useState(''); const [cNote, setCNote] = useState(''); const [editing, setEditing] = useState('');
  const inp = useRef<HTMLInputElement>(null);

  useEffect(() => { setClients(load<Client>(KEY_C)); setRuns(load<Run>(KEY_R)); }, []);
  useEffect(() => {
    if (tab !== 'log') return;
    fetch(`/api/activity?agents=${p.agents.map((a) => a.slug).join(',')}`).then((r) => r.json()).then((d) => { setRows(d.rows); setConnected(d.connected); }).catch(() => setRows([]));
  }, [tab, p.agents]);

  const langs = Array.from(new Set([...country.languages, 'ar', 'en-US']));
  const checks = complianceChecks(country, p.slug);
  const cur = p.agents.find((a) => a.slug === agent);
  const myRuns = runs.filter((r) => p.agents.some((a) => a.slug === r.agent));

  async function run() {
    if (!file || !cur) return;
    setSt('loading'); setErr(''); setRes(null);
    try {
      const f = await shrink(file);
      if (f.size > 4_300_000) throw new Error('الملف أكبر من 4.3MB. صوّره بدقة أقل أو قسّم الملف.');
      const fd = new FormData();
      fd.append('file', f); fd.append('country', code); fd.append('language', lang); fd.append('notes', notes);
      const r = await fetch(`/api/agents/${cur.slug}`, { method: 'POST', body: fd });
      const txt = await r.text();
      let d: Out; try { d = JSON.parse(txt); } catch { throw new Error(r.status === 413 ? 'الملف كبير جداً.' : `ردّ غير متوقع من الخادم (${r.status}).`); }
      if (!r.ok) throw new Error(d.error || 'فشلت المعالجة');
      setRes(d); setSt('done');
      const o: Out = d.output ?? {};
      const run: Run = { id: String(Date.now()), clientId, agent: cur.slug, file: file.name, confidence: d.confidence_score ?? 0, at: new Date().toISOString(),
        summary: Array.isArray(o.clauses) ? `${o.clauses.length} بند · ${o.contract_type ?? ''}` : `${o.vendor_name ?? ''} · ${o.total ?? ''} ${o.currency ?? ''}` };
      const nr = [run, ...runs].slice(0, 200); setRuns(nr); save(KEY_R, nr);
    } catch (e) { setErr(e instanceof Error ? e.message : 'خطأ غير متوقع'); setSt('error'); }
  }

  function saveClient() {
    if (!cName.trim()) return;
    const next = editing ? clients.map((c) => (c.id === editing ? { ...c, name: cName.trim(), note: cNote.trim() } : c))
      : [{ id: String(Date.now()), name: cName.trim(), note: cNote.trim() }, ...clients];
    setClients(next); save(KEY_C, next); setCName(''); setCNote(''); setEditing('');
  }
  function delClient(id: string) { const n = clients.filter((c) => c.id !== id); setClients(n); save(KEY_C, n); if (clientId === id) setClientId(''); }

  const tabs: [Tab, string][] = [['run', 'تشغيل الوكيل'], ['log', 'السجل والأنشطة'], ['clients', `العملاء (${clients.length})`], ['new', 'وكلاء جدد']];

  return (
    <div>
      <div role="tablist" className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {tabs.map(([k, label]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
            className="whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition"
            style={tab === k ? { background: p.color, borderColor: p.color, color: '#020617' } : { borderColor: 'rgba(255,255,255,0.15)', color: '#cbd5e1' }}>{label}</button>
        ))}
      </div>

      {tab === 'run' && (
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            <Step n={1} title="الدولة" color={p.color}>
              <select className={fieldCls} value={code} onChange={(e) => { setCode(e.target.value); setLang(getCountry(e.target.value).languages[0]); }}>
                {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.name_ar} — {c.currency}</option>)}
              </select>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {country.regs.map((r) => <span key={r} className="rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-2 py-0.5 text-xs text-[#cbd5e1]">{r}</span>)}
                {country.restricted && <span className="rounded border border-[rgba(245,158,11,0.4)] bg-[rgba(245,158,11,0.1)] px-2 py-0.5 text-xs text-[#fcd34d]">قيود دفع ← USDT</span>}
              </div>
              <p className="mt-2 text-xs text-[#94a3b8]">{country.tax}</p>
            </Step>
            <Step n={2} title="اللغة" color={p.color}>
              <select className={fieldCls} value={lang} onChange={(e) => setLang(e.target.value)}>
                {langs.map((l) => <option key={l} value={l}>{LANGUAGES[l] ?? l}</option>)}
              </select>
            </Step>
            <Step n={3} title="الوكيل" color={p.color}>
              {p.agents.length === 0 ? (
                <p className="text-sm leading-7 text-[#cbd5e1]">لا يوجد وكيل جاهز لهذه المهنة بعد. شاهد تبويب «وكلاء جدد».</p>
              ) : (
                <div className="space-y-2">
                  {p.agents.map((a) => (
                    <label key={a.slug} className="flex cursor-pointer items-start gap-3 rounded-lg border p-3"
                      style={{ borderColor: agent === a.slug ? p.color : 'rgba(255,255,255,0.1)', background: agent === a.slug ? `${p.color}1a` : 'transparent' }}>
                      <input type="radio" name="agent" checked={agent === a.slug} onChange={() => setAgent(a.slug)} className="mt-1" />
                      <span><span className="block font-semibold">{a.name_ar}</span><span className="block text-sm leading-6 text-[#94a3b8]">{a.desc_ar}</span></span>
                    </label>
                  ))}
                </div>
              )}
            </Step>
            {cur && (
              <>
                <Step n={4} title="الملف والملاحظات" color={p.color}>
                  <input ref={inp} type="file" className="hidden" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.heic,.heif" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setSt('idle'); }} />
                  <button type="button" onClick={() => inp.current?.click()}
                    className="w-full rounded-lg border-2 border-dashed border-[rgba(255,255,255,0.25)] px-4 py-7 text-center text-[#cbd5e1] hover:border-[rgba(255,255,255,0.5)]">
                    {file ? <b className="text-[#f1f5f9]" dir="auto">{file.name}</b> : 'اضغط لاختيار ملف (PDF، صورة، Word، Excel…)'}
                  </button>
                  <textarea className={`${fieldCls} mt-3`} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="ملاحظة اختيارية: ركّز على الضريبة، أو على بند الفسخ…" />
                  <select className={`${fieldCls} mt-3`} value={clientId} onChange={(e) => setClientId(e.target.value)} aria-label="العميل">
                    <option value="">بدون ربط بعميل</option>
                    {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <button onClick={run} disabled={!file || st === 'loading'}
                    className="mt-4 w-full rounded-lg py-3 font-bold text-[#020617] disabled:opacity-40" style={{ background: p.color }}>
                    {st === 'loading' ? 'جارِ التحليل… قد يستغرق دقيقة' : 'ابدأ التحليل ←'}
                  </button>
                  {st === 'error' && <div className={`mt-4 rounded-lg border px-4 py-3 text-sm leading-7 ${sev.blocker}`} dir="auto">⚠ {err}</div>}
                  {st === 'done' && res && <Result data={res} color={p.color} />}
                </Step>
              </>
            )}
            {checks.length > 0 && (
              <section className={card}>
                <h2 className="font-semibold">فحوصات الامتثال: {country.name_ar} × {p.name_ar}</h2>
                <ul className="mt-3 space-y-2">
                  {checks.map((c, i) => <li key={i} className={`rounded-lg border px-3 py-2 text-sm ${sev[c.severity]}`}><b className="ml-2">{sevLabel[c.severity]}</b>{c.text}</li>)}
                </ul>
              </section>
            )}
          </div>
          <aside className="space-y-5">
            <section className={card}>
              <h3 className="font-semibold">تنسيق العملة</h3>
              <div className="mt-3 text-2xl font-bold" dir="ltr">{fmtMoney(1234567.89, country)}</div>
              <div className="mt-1 text-xs text-[#94a3b8]">{country.currency} · {country.locale} · {country.tz}</div>
              {VOLATILE.includes(country.currency) && <p className="mt-3 rounded border border-[rgba(245,158,11,0.3)] bg-[rgba(245,158,11,0.1)] p-2 text-xs text-[#fcd34d]">عملة متقلبة: تُعرض المبالغ كما وردت دون تحويل.</p>}
            </section>
            <section className={`${card} text-sm leading-7`}>
              <h3 className="mb-2 font-semibold">ضمانات كل طلب</h3>
              <ul className="list-disc space-y-1 pr-5 text-[#94a3b8]"><li>مراجعة بوكيل ثانٍ</li><li>تسجيل في سجل التدقيق</li><li>عزل بيانات عميلك</li><li>تصحيحاتك تحسّن النتائج لاحقاً</li></ul>
            </section>
          </aside>
        </div>
      )}

      {tab === 'log' && (
        <div className="space-y-5">
          <section className={card}>
            <h2 className="font-semibold">آخر تحليلاتك على هذا الجهاز</h2>
            {myRuns.length === 0 && <p className="mt-3 text-sm text-[#94a3b8]">لا تحليلات بعد. شغّل وكيلاً وسيظهر هنا.</p>}
            <ul className="mt-3 divide-y divide-[rgba(255,255,255,0.1)]">
              {myRuns.slice(0, 30).map((r) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                  <span><b dir="auto">{r.file}</b> <span className="text-[#94a3b8]">· {p.agents.find((a) => a.slug === r.agent)?.name_ar}</span>
                    {r.clientId && <span className="mr-2 rounded bg-[rgba(255,255,255,0.08)] px-2 py-0.5 text-xs">{clients.find((c) => c.id === r.clientId)?.name ?? 'عميل محذوف'}</span>}
                    <span className="block text-xs text-[#94a3b8]" dir="auto">{r.summary}</span></span>
                  <span className="text-xs text-[#94a3b8]" dir="ltr">{Math.round(r.confidence * 100)}% · {new Date(r.at).toLocaleString('ar')}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className={card}>
            <h2 className="font-semibold">سجل الخادم (قاعدة البيانات)</h2>
            {rows === null && <p className="mt-3 text-sm text-[#94a3b8]">جارِ التحميل…</p>}
            {rows && !connected && <p className="mt-3 text-sm text-[#fcd34d]">قاعدة البيانات غير متصلة.</p>}
            {rows && connected && rows.length === 0 && <p className="mt-3 text-sm text-[#94a3b8]">لا طلبات مسجلة.</p>}
            <ul className="mt-3 divide-y divide-[rgba(255,255,255,0.1)]">
              {(rows ?? []).map((r) => (
                <li key={r.id} className="flex flex-wrap justify-between gap-2 py-2 text-sm">
                  <span>{statusAr[r.status] ?? r.status} <span className="text-[#94a3b8]">{r.agent}</span></span>
                  <span className="text-xs text-[#94a3b8]" dir="ltr">{r.confidence != null ? `${Math.round(r.confidence * 100)}% · ` : ''}{r.created_at.slice(0, 16).replace('T', ' ')}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}

      {tab === 'clients' && (
        <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
          <section className={card}>
            <h2 className="font-semibold">عملاؤك</h2>
            {clients.length === 0 && <p className="mt-3 text-sm text-[#94a3b8]">أضف أول عميل من النموذج المجاور، ثم اربط تحليلاتك به.</p>}
            <ul className="mt-3 space-y-3">
              {clients.map((c) => {
                const n = runs.filter((r) => r.clientId === c.id).length;
                return (
                  <li key={c.id} className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(2,6,23,0.6)] p-4">
                    <div className="flex items-center justify-between gap-2"><b>{c.name}</b><span className="text-xs text-[#94a3b8]">{n} تحليل</span></div>
                    {c.note && <p className="mt-1 text-sm text-[#94a3b8]">{c.note}</p>}
                    <div className="mt-3 flex gap-2 text-xs">
                      <button className="rounded border border-[rgba(255,255,255,0.2)] px-3 py-1" onClick={() => { setEditing(c.id); setCName(c.name); setCNote(c.note); }}>تعديل</button>
                      <button className="rounded border border-[rgba(255,255,255,0.2)] px-3 py-1" onClick={() => { setClientId(c.id); setTab('run'); }}>تحليل جديد له</button>
                      <button className="rounded border border-[rgba(239,68,68,0.4)] px-3 py-1 text-[#fca5a5]" onClick={() => delClient(c.id)}>حذف</button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
          <section className={card}>
            <h2 className="font-semibold">{editing ? 'تعديل عميل' : 'عميل جديد'}</h2>
            <input className={`${fieldCls} mt-3`} value={cName} onChange={(e) => setCName(e.target.value)} placeholder="اسم العميل" />
            <textarea className={`${fieldCls} mt-3`} rows={3} value={cNote} onChange={(e) => setCNote(e.target.value)} placeholder="ملاحظات (اختياري)" />
            <button onClick={saveClient} disabled={!cName.trim()} className="mt-3 w-full rounded-lg py-2.5 font-bold text-[#020617] disabled:opacity-40" style={{ background: p.color }}>{editing ? 'حفظ التعديل' : 'إضافة العميل'}</button>
            {editing && <button onClick={() => { setEditing(''); setCName(''); setCNote(''); }} className="mt-2 w-full text-sm text-[#94a3b8]">إلغاء</button>}
            <p className="mt-3 text-xs leading-6 text-[#94a3b8]">العملاء محفوظون على هذا الجهاز فقط حالياً.</p>
          </section>
        </div>
      )}

      {tab === 'new' && (
        <section className={card}>
          <h2 className="font-semibold">وكلاء قيد البناء لمهنة {p.name_ar}</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {p.planned_agents.map((x) => (
              <li key={x} className="rounded-lg border border-dashed border-[rgba(255,255,255,0.25)] p-4">
                <b>{x}</b><span className="mt-2 block text-xs text-[#94a3b8]">قريباً · سيُضاف هنا بنفس خطوات التشغيل</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
