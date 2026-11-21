-- 026: عرض أعضاء المكتب مع البريد (للمالك والمشرف فقط)
-- إضافة فقط. جدول auth.users غير مقروء من العميل، لذا تُقرأ الأسماء عبر دالة محدودة.
create or replace function list_office_members(p_office uuid)
returns table (user_id uuid, email text, role text, joined_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'auth_required'; end if;
  if coalesce(office_role(p_office), '') not in ('owner','supervisor') then raise exception 'forbidden'; end if;
  return query
    select m.user_id, u.email::text, m.role, m.created_at
    from office_members m join auth.users u on u.id = m.user_id
    where m.office_id = p_office
    order by (m.role = 'owner') desc, m.created_at;
end $$;

revoke all on function list_office_members(uuid) from public, anon;
grant execute on function list_office_members(uuid) to authenticated;
