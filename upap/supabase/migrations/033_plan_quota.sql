create or replace function consume_plan(p_user uuid, p_agent text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_office uuid;
  r record;
  v_cap int;
  v_ws timestamptz;
  v_we timestamptz;
  v_n int;
  v_used int;
  v_has boolean := false;
  v_next timestamptz;
  v_ev bigint;
begin
  perform pg_advisory_xact_lock(hashtext(p_user::text));
  select m.office_id into v_office from office_members m where m.user_id = p_user limit 1;
  if v_office is not null then
    perform pg_advisory_xact_lock(hashtext(v_office::text));
  end if;
  for r in
    select s.id, s.plan_code, s.period, s.started_at, p.monthly_analyses, 'office'::text as scope
      from office_subscriptions s join plans p on p.code = s.plan_code
     where v_office is not null and s.office_id = v_office and s.status = 'active'
       and s.started_at <= now() and s.expires_at > now()
    union all
    select s.id, s.plan_code, s.period, s.started_at, p.monthly_analyses, 'user'::text as scope
      from user_subscriptions s join plans p on p.code = s.plan_code
     where v_office is null and s.user_id = p_user and s.status = 'active'
       and s.started_at <= now() and s.expires_at > now()
    order by monthly_analyses desc, started_at asc
  loop
    v_has := true;
    if r.period = 'weekly' then
      v_cap := r.monthly_analyses / 4;
      v_n := floor(extract(epoch from (now() - r.started_at)) / 604800)::int;
      v_ws := r.started_at + (v_n * interval '7 days');
      v_we := v_ws + interval '7 days';
    else
      v_cap := r.monthly_analyses;
      v_n := (extract(year from age(now(), r.started_at)) * 12 + extract(month from age(now(), r.started_at)))::int;
      v_ws := r.started_at + (v_n * interval '1 month');
      v_we := v_ws + interval '1 month';
    end if;
    select count(*) into v_used from usage_events e
     where e.kind = 'plan' and not e.refunded and e.at >= v_ws and e.at < v_we
       and ((r.scope = 'office' and e.office_id = v_office) or (r.scope = 'user' and e.user_id = p_user));
    if v_used < v_cap then
      insert into usage_events (user_id, office_id, agent_slug, kind)
      values (p_user, v_office, left(coalesce(p_agent, 'unknown'), 80), 'plan') returning id into v_ev;
      return jsonb_build_object('ok', true, 'has_plan', true, 'event_id', v_ev,
        'remaining', v_cap - v_used - 1, 'cap', v_cap, 'resets_at', v_we);
    end if;
    if v_next is null or v_we < v_next then v_next := v_we; end if;
  end loop;
  if v_has then
    return jsonb_build_object('ok', false, 'has_plan', true, 'reason', 'plan_quota_used', 'next_at', v_next);
  end if;
  return jsonb_build_object('ok', false, 'has_plan', false);
end $$;

create or replace function refund_plan(p_event bigint, p_user uuid) returns void
language sql security definer set search_path = public as $$
  update usage_events set refunded = true where id = p_event and user_id = p_user and kind = 'plan';
$$;

create or replace function plan_status_for(p_user uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_office uuid;
  r record;
  v_cap int;
  v_ws timestamptz;
  v_we timestamptz;
  v_n int;
  v_used int;
begin
  select m.office_id into v_office from office_members m where m.user_id = p_user limit 1;
  for r in
    select s.plan_code, s.period, s.started_at, s.expires_at, p.monthly_analyses, 'office'::text as scope
      from office_subscriptions s join plans p on p.code = s.plan_code
     where v_office is not null and s.office_id = v_office and s.status = 'active'
       and s.started_at <= now() and s.expires_at > now()
    union all
    select s.plan_code, s.period, s.started_at, s.expires_at, p.monthly_analyses, 'user'::text as scope
      from user_subscriptions s join plans p on p.code = s.plan_code
     where v_office is null and s.user_id = p_user and s.status = 'active'
       and s.started_at <= now() and s.expires_at > now()
    order by monthly_analyses desc, started_at asc
  loop
    if r.period = 'weekly' then
      v_cap := r.monthly_analyses / 4;
      v_n := floor(extract(epoch from (now() - r.started_at)) / 604800)::int;
      v_ws := r.started_at + (v_n * interval '7 days');
      v_we := v_ws + interval '7 days';
    else
      v_cap := r.monthly_analyses;
      v_n := (extract(year from age(now(), r.started_at)) * 12 + extract(month from age(now(), r.started_at)))::int;
      v_ws := r.started_at + (v_n * interval '1 month');
      v_we := v_ws + interval '1 month';
    end if;
    select count(*) into v_used from usage_events e
     where e.kind = 'plan' and not e.refunded and e.at >= v_ws and e.at < v_we
       and ((r.scope = 'office' and e.office_id = v_office) or (r.scope = 'user' and e.user_id = p_user));
    return jsonb_build_object('has_plan', true, 'plan', r.plan_code, 'period', r.period,
      'used', v_used, 'cap', v_cap, 'resets_at', v_we, 'expires_at', r.expires_at);
  end loop;
  return jsonb_build_object('has_plan', false);
end $$;

revoke all on function consume_plan(uuid, text) from public, anon, authenticated;
revoke all on function refund_plan(bigint, uuid) from public, anon, authenticated;
revoke all on function plan_status_for(uuid) from public, anon, authenticated;
grant execute on function consume_plan(uuid, text) to service_role;
grant execute on function refund_plan(bigint, uuid) to service_role;
grant execute on function plan_status_for(uuid) to service_role;

notify pgrst, 'reload schema';
