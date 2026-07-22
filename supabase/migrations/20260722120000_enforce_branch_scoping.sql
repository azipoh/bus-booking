-- Branch ownership for staff, fleet, trips, and booking visibility.
alter table public.profiles
add column if not exists branch_id uuid references public.branches(id) on delete
set null;
alter table public.buses
add column if not exists branch_id uuid references public.branches(id) on delete
set null;
alter table public.schedules
add column if not exists branch_id uuid references public.branches(id) on delete
set null;
-- Existing schedules inherit ownership from their bus where possible.
update public.schedules s
set branch_id = b.branch_id
from public.buses b
where s.bus_id = b.id
    and s.branch_id is null
    and b.branch_id is not null;
create or replace function public.current_user_branch_id() returns uuid language sql stable security definer
set search_path = public as $$
select branch_id
from public.profiles
where id = auth.uid() $$;
revoke all on function public.current_user_branch_id()
from public,
    anon;
grant execute on function public.current_user_branch_id() to authenticated;
drop policy if exists "Admins can manage buses" on public.buses;
drop policy if exists "Admins can manage schedules" on public.schedules;
drop policy if exists "Anyone can view buses" on public.buses;
drop policy if exists "Anyone can view schedules" on public.schedules;
create policy "Anyone can view buses" on public.buses for
select to authenticated using (true);
create policy "Admins can manage all buses" on public.buses for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Managers can manage own branch buses" on public.buses for all to authenticated using (
    public.has_role(auth.uid(), 'manager')
    and branch_id = public.current_user_branch_id()
) with check (
    public.has_role(auth.uid(), 'manager')
    and branch_id = public.current_user_branch_id()
);
create policy "Anyone can view schedules" on public.schedules for
select to authenticated using (true);
create policy "Admins can manage all schedules" on public.schedules for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Managers can manage own branch schedules" on public.schedules for all to authenticated using (
    public.has_role(auth.uid(), 'manager')
    and branch_id = public.current_user_branch_id()
) with check (
    public.has_role(auth.uid(), 'manager')
    and branch_id = public.current_user_branch_id()
    and exists (
        select 1
        from public.buses b
        where b.id = bus_id
            and b.branch_id = public.current_user_branch_id()
    )
);
-- Managers may report only bookings belonging to schedules in their branch.
drop policy if exists "Users can view own bookings" on public.bookings;
create policy "Users and branch managers can view bookings" on public.bookings for
select to authenticated using (
        auth.uid() = user_id
        or public.has_role(auth.uid(), 'admin')
        or (
            public.has_role(auth.uid(), 'manager')
            and exists (
                select 1
                from public.schedules s
                where s.id = schedule_id
                    and s.branch_id = public.current_user_branch_id()
            )
        )
    );