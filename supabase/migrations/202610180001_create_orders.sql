-- Orders placed through /api/orders/create.
-- Rows are written only by the server with the service role key (which bypasses RLS);
-- there is deliberately no insert policy for anon/authenticated clients.

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_id text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  email text not null,
  phone text not null,
  address_line_1 text not null,
  address_line_2 text,
  city text not null,
  state text not null,
  pincode text not null check (pincode ~ '^\d{6}$'),
  gst_number text,
  payment_method text not null check (payment_method in ('cod', 'stripe')),
  status text not null default 'pending_cod_confirm' check (
    status in (
      'pending_cod_confirm',
      'pending_payment',
      'confirmed',
      'shipped',
      'delivered',
      'cancelled'
    )
  ),
  currency text not null default 'INR',
  subtotal numeric(10, 2) not null check (subtotal >= 0),
  cod_fee numeric(10, 2) not null default 0 check (cod_fee >= 0),
  total numeric(10, 2) not null check (total >= 0),
  line_items jsonb not null check (jsonb_typeof(line_items) = 'array'),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_orders_user_id on public.orders (user_id);
create index if not exists idx_orders_email on public.orders (email);
create index if not exists idx_orders_created_at on public.orders (created_at desc);

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();

alter table public.orders enable row level security;

drop policy if exists orders_select_own_or_admin on public.orders;
create policy orders_select_own_or_admin
on public.orders
for select
using (
  (auth.uid() is not null and auth.uid() = user_id)
  or exists (
    select 1
    from public.users admin_user
    where admin_user.id = auth.uid()
      and admin_user.role = 'admin'
  )
);

drop policy if exists orders_update_admin on public.orders;
create policy orders_update_admin
on public.orders
for update
using (
  exists (
    select 1
    from public.users admin_user
    where admin_user.id = auth.uid()
      and admin_user.role = 'admin'
  )
);
