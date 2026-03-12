-- Initial Supabase schema for auth-linked users and waitlist

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  product_id text not null,
  product_title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (email, product_id)
);

create index if not exists idx_waitlist_product_id on public.waitlist (product_id);
create index if not exists idx_waitlist_email on public.waitlist (email);

create trigger users_set_updated_at
before update on public.users
for each row
execute function public.set_updated_at();

create trigger waitlist_set_updated_at
before update on public.waitlist
for each row
execute function public.set_updated_at();

alter table public.users enable row level security;
alter table public.waitlist enable row level security;

-- users policies
create policy users_select_own_or_admin
on public.users
for select
using (
  auth.uid() = id
  or exists (
    select 1
    from public.users admin_user
    where admin_user.id = auth.uid()
      and admin_user.role = 'admin'
  )
);

create policy users_insert_own
on public.users
for insert
with check (auth.uid() = id);

create policy users_update_own
on public.users
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy users_delete_own
on public.users
for delete
using (auth.uid() = id);

-- waitlist policies
create policy waitlist_insert_public
on public.waitlist
for insert
to anon, authenticated
with check (true);

create policy waitlist_select_owner_or_admin
on public.waitlist
for select
using (
  coalesce(auth.jwt() ->> 'email', '') = email
  or exists (
    select 1
    from public.users admin_user
    where admin_user.id = auth.uid()
      and admin_user.role = 'admin'
  )
);

create policy waitlist_delete_owner_or_admin
on public.waitlist
for delete
using (
  coalesce(auth.jwt() ->> 'email', '') = email
  or exists (
    select 1
    from public.users admin_user
    where admin_user.id = auth.uid()
      and admin_user.role = 'admin'
  )
);
