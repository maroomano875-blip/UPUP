'use client';
// صفحة «مكتبي»: إنشاء مكتب، الانضمام برمز دعوة، توليد رموز، عرض الأعضاء وإزالتهم.
// كل التعديلات تمر عبر دوال RPC في Supabase (025/026) والصلاحيات تُفرض هناك لا هنا.
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useI18n } from './I18nProvider';
import { getBrowserSupabase } from '../../lib/supabaseBrowser';
import { canInvite, canInviteRole, canRemove, formatInviteCode, officeErrorKey, type OfficeRole } from '../../lib/officePolicy';

type Mine = { officeId: string; name: string; role: OfficeRole };
type Member = { user_id: string; email: string; role: OfficeRole; joined_at: string };
type Msg = { kind: 'ok' | 'err'; text: string } | null;

export default function OfficePanel() {
  const { t } = useI18n();
  const sb = getBrowserSupabase();
  const [ready, setReady] = useState(false);
  const [uid, setUid] = useState<string | null>(null);
  const [mine, setMine] = useState<Mine | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [inviteRole, setInviteRole] = useState<'member' | 'supervisor'>('member');
  const [fresh, setFresh] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);

  const load = useCallback(async () => {
    if (!sb) { setReady(true); return; }
    const { data: s } = await sb.auth.getSession();
    const id = s.session?.user.id ?? null;
    setUid(id);
    if (!id) { setMine(null); setReady(true); return; }
    // RLS تضمن أن المستخدم يرى سجل عضويته فقط ضمن مكتبه
    const { data } = await sb.from('office_members').select('office_id, role, offices(name)').eq('user_id', id).maybeSingle();
    if (!data) { setMine(null); setMembers([]); setReady(true); return; }
    const off = data.offices as unknown as { name: string } | { name: string }[] | null;
    const officeName = Array.isArray(off) ? off[0]?.name : off?.name;
    const m: Mine = { officeId: data.office_id as string, name: officeName ?? '', role: data.role as OfficeRole };
    setMine(m);
    if (canInvite(m.role)) {
      const { data: list } = await sb.rpc('list_office_members', { p_office: m.officeId });
      setMembers((list as Member[] | null) ?? []);
    } else setMembers([]);
    setReady(true);
  }, [sb]);

  useEffect(() => { load(); }, [load]);

  // تشغيل عملية RPC مع معالجة موحّدة للأخطاء
  async function run(fn: () => PromiseLike<{ error: { message: string } | null }>, okKey?: string) {
    setBusy(true); setMsg(null);
    const { error } = await fn();
    if (error) setMsg({ kind: 'err', text: t(officeErrorKey(error.message)) });
    else { if (okKey) setMsg({ kind: 'ok', text: t(okKey as never) }); await load(); }
    setBusy(false);
    return !error;
  }

  async function createOffice(e: React.FormEvent) {
    e.preventDefault();
    if (!sb) return;
    if (await run(() => sb.rpc('create_office', { p_name: name }), 'office.ok.created')) setName('');
  }

  async function joinOffice(e: React.FormEvent) {
    e.preventDefault();
    if (!sb) return;
    const c = formatInviteCode(code);
    if (!c) return setMsg({ kind: 'err', text: t('office.err.invalid_code') });
    if (await run(() => sb.rpc('join_office', { p_code: c }), 'office.ok.joined')) setCode('');
  }

  async function makeInvite() {
    if (!sb || !mine) return;
    setBusy(true); setMsg(null); setFresh(null); setCopied(false);
    const { data, error } = await sb.rpc('create_invite', { p_office: mine.officeId, p_role: inviteRole });
    if (error) setMsg({ kind: 'err', text: t(officeErrorKey(error.message)) });
    else setFresh(String(data));
    setBusy(false);
  }

  async function copyCode() {
    if (!fresh) return;
    try { await navigator.clipboard.writeText(fresh); setCopied(true); } catch { /* النسخ اليدوي متاح */ }
  }

  const input = 'w-full rounded-lg border border-[rgba(255,255,255,0.15)] bg-[rgba(2,6,23,0.8)] px-3 py-2.5 text-sm text-[#f1f5f9] outline-none focus:border-[#e0b45a]';
  const btn = 'rounded-lg bg-[#e0b45a] px-4 py-2.5 text-sm font-bold text-[#020617] disabled:opacity-50';
  const card = 'rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.7)] p-4';

  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      <h1 className="text-2xl font-bold">{t('office.title')}</h1>

      {ready && !uid && <p className={card}>{t('office.login')} <Link href="/login" className="font-semibold text-[#e0b45a]">{t('auth.signin')}</Link></p>}

      {ready && uid && !mine && (
        <>
          <p className="text-sm leading-6 text-[#94a3b8]">{t('office.none')}</p>
          <form onSubmit={createOffice} className={`${card} space-y-3`}>
            <h2 className="font-bold">{t('office.create.title')}</h2>
            <input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={80}
              placeholder={t('office.create.name')} aria-label={t('office.create.name')} className={input} />
            <button type="submit" disabled={busy} className={btn}>{t('office.create.btn')}</button>
          </form>
          <form onSubmit={joinOffice} className={`${card} space-y-3`}>
            <h2 className="font-bold">{t('office.join.title')}</h2>
            <p className="text-xs leading-6 text-[#94a3b8]">{t('office.join.hint')}</p>
            <input value={code} onChange={(e) => setCode(e.target.value)} required dir="ltr" autoCapitalize="characters" autoComplete="off"
              placeholder="XXXX-XXXX-XXXX-XXXX" aria-label={t('office.join.code')} className={input} />
            <button type="submit" disabled={busy} className={btn}>{t('office.join.btn')}</button>
          </form>
        </>
      )}

      {ready && mine && (
        <>
          <div className={card}>
            <div className="text-lg font-bold">{mine.name}</div>
            <div className="mt-1 text-sm text-[#94a3b8]">{t('office.yourRole')} {t(`office.role.${mine.role}` as never)}</div>
          </div>

          {canInvite(mine.role) && (
            <div className={`${card} space-y-3`}>
              <h2 className="font-bold">{t('office.invite.title')}</h2>
              {canInviteRole(mine.role, 'supervisor') && (
                <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as 'member' | 'supervisor')} className={input}>
                  <option value="member">{t('office.role.member')}</option>
                  <option value="supervisor">{t('office.role.supervisor')}</option>
                </select>
              )}
              <button onClick={makeInvite} disabled={busy} className={btn}>{t('office.invite.btn')}</button>
              {fresh && (
                <div className="rounded-lg bg-[rgba(2,6,23,0.8)] p-3">
                  <p className="text-xs leading-6 text-[#94a3b8]">{t('office.invite.result')}</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <code dir="ltr" className="select-all text-base font-bold text-[#e0b45a]">{fresh}</code>
                    <button onClick={copyCode} className="text-xs font-semibold text-[#a5b4fc]">{copied ? t('office.copied') : t('office.copy')}</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {canInvite(mine.role) && (
            <div className={card}>
              <h2 className="mb-2 font-bold">{t('office.members')}</h2>
              <ul className="divide-y divide-[rgba(255,255,255,0.08)]">
                {members.map((m) => (
                  <li key={m.user_id} className="flex items-center justify-between gap-2 py-2 text-sm">
                    <span className="min-w-0">
                      <span className="block truncate" dir="ltr">{m.email} {m.user_id === uid ? t('office.you') : ''}</span>
                      <span className="text-xs text-[#94a3b8]">{t(`office.role.${m.role}` as never)}</span>
                    </span>
                    {m.user_id !== uid && canRemove(mine.role, m.role) && (
                      <button disabled={busy} className="shrink-0 text-xs font-semibold text-[#fca5a5]"
                        onClick={() => { if (sb && window.confirm(t('office.remove.confirm'))) run(() => sb.rpc('remove_member', { p_office: mine.officeId, p_user: m.user_id }), 'office.ok.removed'); }}>
                        {t('office.remove')}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {mine.role !== 'owner' && (
            <button disabled={busy} className="text-sm font-semibold text-[#fca5a5]"
              onClick={() => { if (sb && window.confirm(t('office.leave.confirm'))) run(() => sb.rpc('leave_office', { p_office: mine.officeId })); }}>
              {t('office.leave')}
            </button>
          )}
        </>
      )}

      {msg && (
        <p role="status" className={`rounded-lg px-3 py-2 text-sm leading-6 ${msg.kind === 'ok' ? 'bg-[rgba(16,185,129,0.15)] text-[#6ee7b7]' : 'bg-[rgba(239,68,68,0.15)] text-[#fca5a5]'}`}>{msg.text}</p>
      )}
      {!sb && <p className="text-sm text-[#fca5a5]">{t('auth.err.config')}</p>}
      <Link href="/" className="block text-center text-xs text-[#a5b4fc]">{t('office.back')}</Link>
    </div>
  );
}
