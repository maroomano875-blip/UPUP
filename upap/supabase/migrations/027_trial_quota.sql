-- 027: التجربة المجانية — تحليل واحد كل يوم لمدة 3 أيام (اليوم بتوقيت المستخدم المثبَّت عند أول استعمال)
-- إضافة فقط. الدوال للخادم (service_role) حصراً؛ المستخدم يقرأ حالته عبر my_trial_status() فقط.
alter table trials add column if not exists tz text not null default 'UTC';
alter table trials add column if not exists first_day date;
alter table trials add column if not exists identity_key text;   -- بريد مُطبَّع: يمنع تجارب متعددة بالأسماء المستعارة (a+1@gmail)
create unique index if not exists uq_trials_identity on trials(identity_key) where identity_key is not null;
alter table usage_events add column if not exists refunded boolean not null default false;  -- استرجاع عند فشل التحليل بلا حذف

-- يستهلك تحليل اليوم ذرّياً. يرجع {ok, reason, event_id, day, ends_at, next_at}
create or replace function consume_trial(p_user uuid, p_tz text, p_provider text, p_identity text, p_agent text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  zone text := case when exists (select 1 from pg_timezone_names where name = p_tz) then p_tz else 'UTC' end;
  t trials%rowtype;
  today date;
  used int;
  ev bigint;
  off uuid;
begin
  select * into t from trials where user_id = p_user for update;
  if not found then
    if p_identity is not null and exists (select 1 from trials where identity_key = p_identity) then
      return jsonb_build_object('ok', false, 'reason', 'trial_already_used');
    end if;
    begin
      insert into trials (user_id, provider, tz, first_day, identity_key, started_at, ends_at)
      values (p_user, coalesce(p_provider, 'unknown'), zone, (now() at time zone zone)::date, p_identity, now(),
              (((now() at time zone zone)::date + 3)::timestamp at time zone zone));
    exception when unique_violation then
      if not exists (select 1 from trials where user_id = p_user) then
        return jsonb_build_object('ok', false, 'reason', 'trial_already_used');
      end if;
    end;
    select * into t from trials where user_id = p_user for update;
  end if;

  today := (now() at time zone t.tz)::date;
  if t.first_day is null then
    update trials set first_day = today where user_id = p_user;
    t.first_day := today;
  end if;
  if today > t.first_day + 2 then
    return jsonb_build_object('ok', false, 'reason', 'trial_ended', 'ends_at', t.ends_at);
  end if;

  select count(*) into used from usage_events
   where user_id = p_user and kind = 'trial' and not refunded and (at at time zone t.tz)::date = today;
  if used >= 1 then
    return jsonb_build_object('ok', false, 'reason', 'trial_daily_used',
                              'next_at', ((today + 1)::timestamp at time zone t.tz));
  end if;

  select office_id into off from office_members where user_id = p_user;
  insert into usage_events (user_id, office_id, agent_slug, kind)
  values (p_user, off, left(coalesce(p_agent, 'unknown'), 80), 'trial') returning id into ev;
  return jsonb_build_object('ok', true, 'event_id', ev, 'day', (today - t.first_day) + 1, 'ends_at', t.ends_at);
end $$;

-- استرجاع التحليل عند فشله (علامة refunded بدل الحذف)
create or replace function refund_trial(p_event bigint, p_user uuid) returns void
language sql security definer set search_path = public as $$
  update usage_events set refunded = true where id = p_event and user_id = p_user and kind = 'trial';
$$;

-- حالة التجربة للمستخدم الحالي (للعرض فقط)
create or replace function my_trial_status() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  t trials%rowtype;
  today date;
  used int;
begin
  if auth.uid() is null then raise exception 'auth_required'; end if;
  select * into t from trials where user_id = auth.uid();
  if not found or t.first_day is null then return jsonb_build_object('has_trial', false); end if;
  today := (now() at time zone t.tz)::date;
  select count(*) into used from usage_events
   where user_id = auth.uid() and kind = 'trial' and not refunded and (at at time zone t.tz)::date = today;
  return jsonb_build_object('has_trial', true, 'day', least((today - t.first_day) + 1, 4),
    'ended', today > t.first_day + 2, 'used_today', used >= 1, 'ends_at', t.ends_at,
    'next_at', ((today + 1)::timestamp at time zone t.tz));
end $$;

revoke all on function consume_trial(uuid, text, text, text, text) from public, anon, authenticated;
revoke all on function refund_trial(bigint, uuid) from public, anon, authenticated;
revoke all on function my_trial_status() from public, anon;
grant execute on function consume_trial(uuid, text, text, text, text) to service_role;
grant execute on function refund_trial(bigint, uuid) to service_role;
grant execute on function my_trial_status() to authenticated;
