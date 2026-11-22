-- 029: prices, individual plan, user subscriptions, payment order creation
-- Additive only. No deletes. Safe to re-run.

-- plan kind: office plans vs the individual plan
alter table plans add column if not exists kind text not null default 'office';

insert into plans (code, name, max_members, monthly_analyses, kind) values
  ('individual', 'Individual', 1, 60, 'individual')
on conflict (code) do nothing;

-- approved prices in USDT (weekly, monthly, yearly = pay 9 months get 12)
update plans set price_weekly_usdt = 3,  price_monthly_usdt = 8,  price_yearly_usdt = 72  where code = 'individual';
update plans set price_weekly_usdt = 5,  price_monthly_usdt = 15, price_yearly_usdt = 135 where code = 'small';
update plans set price_weekly_usdt = 9,  price_monthly_usdt = 29, price_yearly_usdt = 261 where code = 'medium';
update plans set price_weekly_usdt = 19, price_monthly_usdt = 59, price_yearly_usdt = 531 where code = 'large';

-- subscriptions for individual users (no office)
create table if not exists user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  plan_code text not null references plans(code),
  period text not null check (period in ('weekly','monthly','yearly')),
  status text not null default 'active' check (status in ('active','expired','cancelled')),
  started_at timestamptz not null default now(),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_user_subs_user on user_subscriptions(user_id, status, expires_at);
alter table user_subscriptions enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='user_subscriptions' and policyname='user_subs_read_own') then
    create policy "user_subs_read_own" on user_subscriptions for select using (user_id = auth.uid());
  end if;
end $$;

-- payment orders may belong to a user (individual) or an office
alter table payment_orders alter column office_id drop not null;
alter table payment_orders add column if not exists user_id uuid references auth.users(id) on delete restrict;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'payment_orders_target') then
    alter table payment_orders add constraint payment_orders_target check (office_id is not null or user_id is not null);
  end if;
end $$;
create index if not exists idx_payment_orders_user on payment_orders(user_id, created_at desc);
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='payment_orders' and policyname='orders_read_own') then
    create policy "orders_read_own" on payment_orders for select using (user_id = auth.uid());
  end if;
end $$;

-- lock: an active individual subscriber cannot create or join an office
create or replace function block_individual_in_office() returns trigger
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  select count(*) into n from user_subscriptions
    where user_id = new.user_id and status = 'active' and expires_at > now();
  if n > 0 then raise exception 'individual_plan'; end if;
  return new;
end $$;

create or replace trigger trg_block_individual_in_office
  before insert on office_members
  for each row execute function block_individual_in_office();

-- create a payment order with a unique amount (server only)
create or replace function create_payment_order(p_user uuid, p_plan text, p_period text)
returns table (order_id uuid, amount_usdt numeric, expires_at timestamptz)
language plpgsql security definer set search_path = public as $$
declare
  pl plans%rowtype;
  base numeric;
  oid uuid;
  recent int;
  amt numeric;
  new_id uuid;
  new_exp timestamptz;
  i int := 0;
begin
  if p_user is null then raise exception 'auth_required'; end if;
  if p_period not in ('weekly','monthly','yearly') then raise exception 'invalid_period'; end if;
  select * into pl from plans where code = p_plan and is_active;
  if not found then raise exception 'invalid_plan'; end if;
  base := case p_period when 'weekly' then pl.price_weekly_usdt when 'monthly' then pl.price_monthly_usdt else pl.price_yearly_usdt end;
  if base is null then raise exception 'price_missing'; end if;

  if pl.kind = 'office' then
    select m.office_id into oid from office_members m where m.user_id = p_user and m.role = 'owner' limit 1;
    if oid is null then raise exception 'office_owner_required'; end if;
  else
    if exists (select 1 from office_members m where m.user_id = p_user) then raise exception 'in_office'; end if;
  end if;

  select count(*) into recent from payment_orders o where o.user_id = p_user and o.created_at > now() - interval '1 hour';
  if recent >= 10 then raise exception 'too_many_orders'; end if;

  -- free amounts of stale or superseded pending orders
  update payment_orders set status = 'expired' where status = 'pending' and (expires_at <= now() or user_id = p_user);

  loop
    i := i + 1;
    if i > 30 then raise exception 'amount_busy'; end if;
    amt := base + ((floor(random() * 99) + 1) / 1000.0);
    begin
      insert into payment_orders (office_id, user_id, plan_code, period, amount_usdt)
      values (oid, p_user, p_plan, p_period, amt)
      returning id, payment_orders.expires_at into new_id, new_exp;
      exit;
    exception when unique_violation then
      null;
    end;
  end loop;

  order_id := new_id;
  amount_usdt := amt;
  expires_at := new_exp;
  return next;
end $$;

revoke all on function create_payment_order(uuid, text, text) from public, anon, authenticated;
grant execute on function create_payment_order(uuid, text, text) to service_role;
