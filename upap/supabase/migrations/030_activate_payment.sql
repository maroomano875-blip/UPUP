-- 030: activate a paid order, billing audit, in-platform notifications, my_subscription
-- Additive only. No deletes. Safe to re-run.

-- billing audit log (mandatory: every money-related change is recorded)
create table if not exists billing_audit (
  id bigint generated always as identity primary key,
  order_id uuid references payment_orders(id) on delete restrict,
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_billing_audit_order on billing_audit(order_id);
alter table billing_audit enable row level security;
-- no policies: server (service role) only

-- in-platform notifications
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index if not exists idx_notifications_user on notifications(user_id, created_at desc);
alter table notifications enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='notifications' and policyname='notifications_read_own') then
    create policy "notifications_read_own" on notifications for select using (user_id = auth.uid());
  end if;
end $$;

create or replace function mark_notifications_read() returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'auth_required'; end if;
  update notifications set read_at = now() where user_id = auth.uid() and read_at is null;
end $$;
revoke all on function mark_notifications_read() from public, anon;
grant execute on function mark_notifications_read() to authenticated;

-- activate a paid order exactly once (server only)
create or replace function activate_payment(p_order uuid, p_tx text)
returns table (already boolean, user_id uuid, plan_code text, period text, expires_at timestamptz)
language plpgsql security definer set search_path = public as $$
declare
  o payment_orders%rowtype;
  starts timestamptz;
  ends timestamptz;
  cur timestamptz;
  span interval;
begin
  if p_tx is null or char_length(p_tx) < 8 then raise exception 'invalid_tx'; end if;
  select * into o from payment_orders where id = p_order for update;
  if not found then raise exception 'order_not_found'; end if;

  if o.status = 'paid' then
    already := true; user_id := o.user_id; plan_code := o.plan_code; period := o.period;
    if o.office_id is not null then
      select max(s.expires_at) into ends from office_subscriptions s where s.office_id = o.office_id;
    else
      select max(s.expires_at) into ends from user_subscriptions s where s.user_id = o.user_id;
    end if;
    expires_at := ends;
    return next;
    return;
  end if;
  if o.status <> 'pending' then raise exception 'order_not_pending'; end if;

  span := case o.period when 'weekly' then interval '7 days' when 'monthly' then interval '1 month' else interval '1 year' end;

  if o.office_id is not null then
    select max(s.expires_at) into cur from office_subscriptions s
      where s.office_id = o.office_id and s.plan_code = o.plan_code and s.status = 'active' and s.expires_at > now();
    starts := greatest(now(), coalesce(cur, now()));
    ends := starts + span;
    insert into office_subscriptions (office_id, plan_code, period, status, started_at, expires_at)
      values (o.office_id, o.plan_code, o.period, 'active', starts, ends);
  else
    select max(s.expires_at) into cur from user_subscriptions s
      where s.user_id = o.user_id and s.plan_code = o.plan_code and s.status = 'active' and s.expires_at > now();
    starts := greatest(now(), coalesce(cur, now()));
    ends := starts + span;
    insert into user_subscriptions (user_id, plan_code, period, status, started_at, expires_at)
      values (o.user_id, o.plan_code, o.period, 'active', starts, ends);
  end if;

  update payment_orders set status = 'paid', tx_id = p_tx, paid_at = now() where id = o.id;
  insert into billing_audit (order_id, user_id, action, meta)
    values (o.id, o.user_id, 'payment_activated',
            jsonb_build_object('plan', o.plan_code, 'period', o.period, 'amount', o.amount_usdt, 'tx', p_tx, 'expires_at', ends));
  insert into notifications (user_id, kind, meta)
    values (o.user_id, 'subscribed', jsonb_build_object('plan', o.plan_code, 'period', o.period, 'expires_at', ends));

  already := false; user_id := o.user_id; plan_code := o.plan_code; period := o.period; expires_at := ends;
  return next;
end $$;
revoke all on function activate_payment(uuid, text) from public, anon, authenticated;
grant execute on function activate_payment(uuid, text) to service_role;

-- current subscription of the calling user (office plan first, then individual)
create or replace function my_subscription() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  oid uuid;
  r jsonb;
begin
  if uid is null then raise exception 'auth_required'; end if;
  select m.office_id into oid from office_members m where m.user_id = uid limit 1;
  if oid is not null then
    select jsonb_build_object('plan', s.plan_code, 'period', s.period, 'expires_at', s.expires_at, 'scope', 'office')
      into r from office_subscriptions s
      where s.office_id = oid and s.status = 'active' and s.expires_at > now()
      order by s.expires_at desc limit 1;
    return r;
  end if;
  select jsonb_build_object('plan', s.plan_code, 'period', s.period, 'expires_at', s.expires_at, 'scope', 'individual')
    into r from user_subscriptions s
    where s.user_id = uid and s.status = 'active' and s.expires_at > now()
    order by s.expires_at desc limit 1;
  return r;
end $$;
revoke all on function my_subscription() from public, anon;
grant execute on function my_subscription() to authenticated;
