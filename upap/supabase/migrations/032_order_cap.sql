-- 032 raise hourly order cap (English only)
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
  if recent >= 30 then raise exception 'too_many_orders'; end if;

  update payment_orders po set status = 'expired' where po.status = 'pending' and (po.expires_at <= now() or po.user_id = p_user);

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

notify pgrst, 'reload schema';
