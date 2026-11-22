-- 028: حد أعضاء المكتب حسب الخطة (صارم) + حالة التجربة للإشعارات
-- إضافة/استبدال دوال فقط (create or replace)، بلا حذف ولا تعديل جداول.
-- القاعدة: مكتب بلا اشتراك فعّال = مالكه وحده (حد 1). المكتب المشترك: حد خطته.
-- الأعضاء الموجودون قبل التطبيق لا يُزالون؛ يُمنع فقط إضافة جدد فوق الحد.

create or replace function office_member_limit(oid uuid) returns int
language sql stable security definer set search_path = public as $$
  select coalesce((
    select max(p.max_members) from office_subscriptions s join plans p on p.code = s.plan_code
    where s.office_id = oid and s.status = 'active' and (s.expires_at is null or s.expires_at > now())
  ), 1);
$$;

-- أرقام الحد للعرض (لأعضاء المكتب فقط)
create or replace function my_office_limits(p_office uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare lim int; mem int; pend int;
begin
  if auth.uid() is null then raise exception 'auth_required'; end if;
  if not is_office_member(p_office) then raise exception 'not_in_office'; end if;
  lim := office_member_limit(p_office);
  select count(*) into mem from office_members where office_id = p_office;
  select count(*) into pend from office_invites where office_id = p_office and used_at is null and expires_at > now();
  return jsonb_build_object('limit', lim, 'members', mem, 'pending', pend,
    'subscribed', exists (select 1 from office_subscriptions where office_id = p_office and status = 'active' and (expires_at is null or expires_at > now())));
end $$;

-- دعوة: الأعضاء + الدعوات المعلّقة لا يتجاوزان الحد
create or replace function create_invite(p_office uuid, p_role text default 'member') returns text
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  caller text;
  raw text;
  code text;
  lock_id uuid;
begin
  if uid is null then raise exception 'auth_required'; end if;
  if p_role not in ('supervisor','member') then raise exception 'invalid_role'; end if;
  select role into caller from office_members where office_id = p_office and user_id = uid;
  if caller is null then raise exception 'not_in_office'; end if;
  if caller = 'member' then raise exception 'forbidden'; end if;
  if caller = 'supervisor' and p_role <> 'member' then raise exception 'forbidden'; end if;
  -- قفل صف المكتب لتسلسل الطلبات المتزامنة
  select id into lock_id from offices where id = p_office for update;
  if (select count(*) from office_members where office_id = p_office)
     + (select count(*) from office_invites where office_id = p_office and used_at is null and expires_at > now())
     >= office_member_limit(p_office) then
    raise exception 'member_limit';
  end if;
  raw := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 16));
  code := substr(raw,1,4) || '-' || substr(raw,5,4) || '-' || substr(raw,9,4) || '-' || substr(raw,13,4);
  insert into office_invites (office_id, code_hash, role, created_by, expires_at)
  values (p_office, encode(sha256(convert_to(raw, 'utf8')), 'hex'), p_role, uid, now() + interval '48 hours');
  insert into office_audit (office_id, actor_id, action, meta) values (p_office, uid, 'invite_created', jsonb_build_object('role', p_role));
  return code;
end $$;

-- انضمام: يُرفض إن امتلأ المكتب (حتى لو كانت الدعوة صالحة)
create or replace function join_office(p_code text) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  raw text := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  inv office_invites%rowtype;
  lock_id uuid;
begin
  if uid is null then raise exception 'auth_required'; end if;
  if char_length(raw) <> 16 then raise exception 'invalid_code'; end if;
  if exists (select 1 from office_members where user_id = uid) then raise exception 'already_in_office'; end if;
  select * into inv from office_invites
    where code_hash = encode(sha256(convert_to(raw, 'utf8')), 'hex')
    for update;
  if not found or inv.used_at is not null or inv.expires_at <= now() then raise exception 'invalid_code'; end if;
  select id into lock_id from offices where id = inv.office_id for update;
  if (select count(*) from office_members where office_id = inv.office_id) >= office_member_limit(inv.office_id) then
    raise exception 'member_limit';
  end if;
  insert into office_members (office_id, user_id, role) values (inv.office_id, uid, inv.role);
  update office_invites set used_by = uid, used_at = now() where id = inv.id;
  insert into office_audit (office_id, actor_id, action, target_user, meta)
    values (inv.office_id, uid, 'member_joined', uid, jsonb_build_object('role', inv.role));
  return inv.office_id;
end $$;

-- حالة التجربة (للخادم): تُستعمل في /api/me وتُغذّي إشعارات الفرص الثلاث
create or replace function trial_status_for(p_user uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  t trials%rowtype;
  today date;
  used_today int;
  used_total int;
begin
  select * into t from trials where user_id = p_user;
  if not found or t.first_day is null then
    return jsonb_build_object('has_trial', false, 'used_total', 0, 'max', 3, 'finished', false);
  end if;
  today := (now() at time zone t.tz)::date;
  select count(*) filter (where (at at time zone t.tz)::date = today), count(*)
    into used_today, used_total
    from usage_events where user_id = p_user and kind = 'trial' and not refunded;
  return jsonb_build_object('has_trial', true, 'used_total', used_total, 'max', 3,
    'day', least((today - t.first_day) + 1, 4),
    'finished', used_total >= 3 or today > t.first_day + 2,
    'used_today', used_today >= 1, 'ends_at', t.ends_at,
    'next_at', ((today + 1)::timestamp at time zone t.tz));
end $$;

create or replace function my_trial_status() returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'auth_required'; end if;
  return trial_status_for(auth.uid());
end $$;

revoke all on function office_member_limit(uuid) from public, anon, authenticated;
revoke all on function trial_status_for(uuid) from public, anon, authenticated;
revoke all on function my_office_limits(uuid) from public, anon;
revoke all on function create_invite(uuid, text) from public, anon;
revoke all on function join_office(text) from public, anon;
revoke all on function my_trial_status() from public, anon;
grant execute on function office_member_limit(uuid) to service_role;
grant execute on function trial_status_for(uuid) to service_role;
grant execute on function my_office_limits(uuid) to authenticated;
grant execute on function create_invite(uuid, text) to authenticated;
grant execute on function join_office(text) to authenticated;
grant execute on function my_trial_status() to authenticated;
