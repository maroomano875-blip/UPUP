-- 025: إدارة المكاتب والأعضاء (المرحلة 3)
-- إضافة فقط: جدول دعوات + سجل تدقيق + دوال RPC آمنة (security definer).
-- لا كتابة مباشرة من العميل: كل التعديلات تمر عبر الدوال أدناه.
-- القاعدة المعتمدة: مستخدم واحد = مكتب واحد (فهرس 024).

-- ── دعوات الانضمام (نخزّن بصمة الرمز لا الرمز نفسه) ─────────────────
create table if not exists office_invites (
  id uuid primary key default gen_random_uuid(),
  office_id uuid not null references offices(id) on delete cascade,
  code_hash text not null unique,
  role text not null check (role in ('supervisor','member')),
  created_by uuid not null references auth.users(id) on delete restrict,
  expires_at timestamptz not null,
  used_by uuid references auth.users(id) on delete set null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_office_invites_office on office_invites(office_id);

-- ── سجل التدقيق (إلزامي) ────────────────────────────────────────────
create table if not exists office_audit (
  id bigint generated always as identity primary key,
  office_id uuid not null references offices(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_user uuid,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_office_audit_office on office_audit(office_id, created_at desc);

alter table office_invites enable row level security;
alter table office_audit enable row level security;
-- الدعوات: لا سياسات = لا وصول مباشر (الدوال فقط)

do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='office_audit' and policyname='audit_read_staff') then
    create policy "audit_read_staff" on office_audit for select using (office_role(office_id) in ('owner','supervisor'));
  end if;
end $$;

-- ── إنشاء مكتب: المستخدم يصبح مالكه ─────────────────────────────────
create or replace function create_office(p_name text) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  nm text := btrim(coalesce(p_name, ''));
  oid uuid;
begin
  if uid is null then raise exception 'auth_required'; end if;
  if char_length(nm) < 2 or char_length(nm) > 80 then raise exception 'invalid_name'; end if;
  if exists (select 1 from office_members where user_id = uid) then raise exception 'already_in_office'; end if;
  insert into offices (name, owner_id) values (nm, uid) returning id into oid;
  insert into office_members (office_id, user_id, role) values (oid, uid, 'owner');
  insert into office_audit (office_id, actor_id, action, meta) values (oid, uid, 'office_created', jsonb_build_object('name', nm));
  return oid;
end $$;

-- ── توليد رمز دعوة (صالح 48 ساعة، استعمال واحد) ─────────────────────
-- المالك: لأي دور. المشرف: لدور member فقط. يُعاد الرمز مرة واحدة فقط.
create or replace function create_invite(p_office uuid, p_role text default 'member') returns text
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  caller text;
  raw text;
  code text;
begin
  if uid is null then raise exception 'auth_required'; end if;
  if p_role not in ('supervisor','member') then raise exception 'invalid_role'; end if;
  select role into caller from office_members where office_id = p_office and user_id = uid;
  if caller is null then raise exception 'not_in_office'; end if;
  if caller = 'member' then raise exception 'forbidden'; end if;
  if caller = 'supervisor' and p_role <> 'member' then raise exception 'forbidden'; end if;
  -- سقف احتياطي للدعوات المعلّقة (سقف الأعضاء الفعلي يُربط بالخطة في المرحلة 5)
  if (select count(*) from office_invites
        where office_id = p_office and used_at is null and expires_at > now()) >= 20 then
    raise exception 'too_many_pending_invites';
  end if;
  raw := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 16));
  code := substr(raw,1,4) || '-' || substr(raw,5,4) || '-' || substr(raw,9,4) || '-' || substr(raw,13,4);
  insert into office_invites (office_id, code_hash, role, created_by, expires_at)
  values (p_office, encode(sha256(convert_to(raw, 'utf8')), 'hex'), p_role, uid, now() + interval '48 hours');
  insert into office_audit (office_id, actor_id, action, meta) values (p_office, uid, 'invite_created', jsonb_build_object('role', p_role));
  return code;
end $$;

-- ── الانضمام برمز ───────────────────────────────────────────────────
create or replace function join_office(p_code text) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  raw text := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  inv office_invites%rowtype;
begin
  if uid is null then raise exception 'auth_required'; end if;
  if char_length(raw) <> 16 then raise exception 'invalid_code'; end if;
  if exists (select 1 from office_members where user_id = uid) then raise exception 'already_in_office'; end if;
  select * into inv from office_invites
    where code_hash = encode(sha256(convert_to(raw, 'utf8')), 'hex')
    for update;
  if not found or inv.used_at is not null or inv.expires_at <= now() then raise exception 'invalid_code'; end if;
  insert into office_members (office_id, user_id, role) values (inv.office_id, uid, inv.role);
  update office_invites set used_by = uid, used_at = now() where id = inv.id;
  insert into office_audit (office_id, actor_id, action, target_user, meta)
    values (inv.office_id, uid, 'member_joined', uid, jsonb_build_object('role', inv.role));
  return inv.office_id;
end $$;

-- ── إزالة عضو (المالك: أي أحد عدا نفسه — المشرف: الأعضاء فقط) ─────────
create or replace function remove_member(p_office uuid, p_user uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  caller text;
  target text;
begin
  if uid is null then raise exception 'auth_required'; end if;
  select role into caller from office_members where office_id = p_office and user_id = uid;
  select role into target from office_members where office_id = p_office and user_id = p_user;
  if caller is null or caller = 'member' then raise exception 'forbidden'; end if;
  if target is null then raise exception 'not_found'; end if;
  if target = 'owner' then raise exception 'cannot_remove_owner'; end if;
  if caller = 'supervisor' and target <> 'member' then raise exception 'forbidden'; end if;
  delete from office_members where office_id = p_office and user_id = p_user;
  insert into office_audit (office_id, actor_id, action, target_user, meta)
    values (p_office, uid, 'member_removed', p_user, jsonb_build_object('role', target));
end $$;

-- ── مغادرة المكتب (غير المالك) ───────────────────────────────────────
create or replace function leave_office(p_office uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  caller text;
begin
  if uid is null then raise exception 'auth_required'; end if;
  select role into caller from office_members where office_id = p_office and user_id = uid;
  if caller is null then raise exception 'not_in_office'; end if;
  if caller = 'owner' then raise exception 'owner_cannot_leave'; end if;
  delete from office_members where office_id = p_office and user_id = uid;
  insert into office_audit (office_id, actor_id, action, target_user, meta)
    values (p_office, uid, 'member_left', uid, jsonb_build_object('role', caller));
end $$;

-- ── الصلاحيات: للمسجَّلين فقط، لا للزوار ─────────────────────────────
revoke all on function create_office(text) from public, anon;
revoke all on function create_invite(uuid, text) from public, anon;
revoke all on function join_office(text) from public, anon;
revoke all on function remove_member(uuid, uuid) from public, anon;
revoke all on function leave_office(uuid) from public, anon;
grant execute on function create_office(text) to authenticated;
grant execute on function create_invite(uuid, text) to authenticated;
grant execute on function join_office(text) to authenticated;
grant execute on function remove_member(uuid, uuid) to authenticated;
grant execute on function leave_office(uuid) to authenticated;
