create extension if not exists pgcrypto;
create table if not exists public.branches (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    location text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
alter table public.user_roles
add column if not exists branch_id uuid references public.branches(id) on delete
set null;
alter type public.app_role
add value if not exists 'manager';
alter type public.app_role
add value if not exists 'cashier';