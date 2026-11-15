create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

revoke all on function public.current_user_role() from public;
grant execute on function public.current_user_role() to authenticated;

create policy "Owners and admins can read all profiles"
  on public.profiles for select
  to authenticated
  using (public.current_user_role() in ('owner', 'admin'));
