alter table public.branches
add column if not exists city text,
    add column if not exists address text,
    add column if not exists phone text,
    add column if not exists is_active boolean not null default true;
update public.branches
set city = coalesce(city, location)
where city is null
    and location is not null;
create or replace function public.set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now();
return new;
end;
$$;
drop trigger if exists branches_set_updated_at on public.branches;
create trigger branches_set_updated_at before
update on public.branches for each row execute function public.set_updated_at();