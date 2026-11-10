-- ============================================================
-- RESTAURANT POS & MANAGEMENT SYSTEM — SUPABASE SQL SCHEMA
-- Run this ENTIRE script in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ===================== SETTINGS =====================
create table if not exists public.settings (
  id          uuid primary key default gen_random_uuid(),
  company_name text default 'My Restaurant',
  tagline      text default '',
  phone        text default '',
  address      text default '',
  currency     text default '$',
  sales_tax_percent    numeric default 8,
  service_charge_percent numeric default 10,
  logo_data_url text default '',
  wifi_password text default '',
  gst_number    text default '',
  updated_at    timestamptz default now()
);
-- Only ever 1 settings row
insert into public.settings (id) values ('00000000-0000-0000-0000-000000000001')
  on conflict (id) do nothing;

-- ===================== USERS =====================
create table if not exists public.users (
  id          text primary key,
  username    text unique not null,
  password    text not null,
  role        text not null default 'Waiter',
  name        text,
  created_at  timestamptz default now()
);

-- ===================== RESTAURANT TABLES =====================
create table if not exists public.restaurant_tables (
  id               text primary key,
  name             text not null,
  section          text default 'Main Floor',
  capacity         int  default 4,
  status           text default 'available',
  current_order_id text,
  server_name      text,
  created_at       timestamptz default now()
);

-- ===================== MENU ITEMS =====================
create table if not exists public.menu_items (
  id          text primary key,
  name        text not null,
  category    text,
  price       numeric not null default 0,
  cost        numeric default 0,
  prep_time   int default 10,
  dietary     text default 'veg',
  spicy_level int default 0,
  popular     boolean default false,
  in_stock    boolean default true,
  description text default '',
  image_url   text default '',
  variants    jsonb default '[]'::jsonb,
  addons      jsonb default '[]'::jsonb,
  created_at  timestamptz default now()
);

-- ===================== ORDERS =====================
create table if not exists public.orders (
  id               text primary key,
  order_number     text,
  type             text default 'dine_in',
  table_id         text,
  table_name       text,
  guest_count      int default 1,
  server_name      text,
  customer_name    text,
  customer_phone   text,
  customer_address text,
  status           text default 'preparing',
  items            jsonb default '[]'::jsonb,
  subtotal         numeric default 0,
  discount         numeric default 0,
  tax              numeric default 0,
  service_charge   numeric default 0,
  tip              numeric default 0,
  total            numeric default 0,
  payment_method   text,
  created_at       timestamptz default now()
);

-- ===================== KOTS (Kitchen Order Tickets) =====================
create table if not exists public.kots (
  id           text primary key,
  kot_number   text,
  order_id     text,
  table_id     text,
  table_name   text,
  order_type   text,
  server_name  text,
  status       text default 'cooking',
  items        jsonb default '[]'::jsonb,
  notes        text default '',
  created_at   timestamptz default now()
);

-- ===================== RESERVATIONS =====================
create table if not exists public.reservations (
  id              text primary key,
  guest_name      text,
  phone           text,
  party_size      int default 1,
  date            text,
  time            text,
  table_id        text,
  table_name      text,
  special_request text,
  status          text default 'confirmed',
  created_at      timestamptz default now()
);

-- ===================== INVENTORY =====================
create table if not exists public.inventory (
  id             text primary key,
  name           text not null,
  category       text,
  current_stock  numeric default 0,
  min_stock      numeric default 0,
  unit           text,
  cost_per_unit  numeric default 0,
  supplier       text,
  created_at     timestamptz default now()
);

-- ===================== SALES (Completed Orders) =====================
create table if not exists public.sales (
  id              text primary key,
  order_id        text,
  order_number    text,
  type            text,
  table_name      text,
  server_name     text,
  customer_name   text,
  items           jsonb default '[]'::jsonb,
  subtotal        numeric default 0,
  discount        numeric default 0,
  tax             numeric default 0,
  service_charge  numeric default 0,
  total           numeric default 0,
  payment_method  text,
  date            timestamptz default now()
);

-- ===================== EXPENSES =====================
create table if not exists public.expenses (
  id         text primary key,
  title      text,
  category   text,
  amount     numeric default 0,
  date       text,
  paid_by    text,
  created_at timestamptz default now()
);

-- ===================== STAFF =====================
create table if not exists public.staff (
  id         text primary key,
  name       text,
  role       text,
  created_at timestamptz default now()
);

-- ===================== NOTIFICATIONS =====================
create table if not exists public.notifications (
  id          text primary key,
  title       text,
  message     text,
  target_role text,
  type        text,
  data        jsonb default '{}'::jsonb,
  read        boolean default false,
  timestamp   timestamptz default now()
);

-- ===================== ENABLE REALTIME =====================
-- Enable realtime for the most time-sensitive tables
alter publication supabase_realtime add table public.kots;
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.restaurant_tables;
alter publication supabase_realtime add table public.notifications;

-- ===================== ROW LEVEL SECURITY =====================
-- For this POS system we use anon key (no Supabase auth),
-- so we set open policies. You can restrict these later.
alter table public.settings           enable row level security;
alter table public.users              enable row level security;
alter table public.restaurant_tables  enable row level security;
alter table public.menu_items         enable row level security;
alter table public.orders             enable row level security;
alter table public.kots               enable row level security;
alter table public.reservations       enable row level security;
alter table public.inventory          enable row level security;
alter table public.sales              enable row level security;
alter table public.expenses           enable row level security;
alter table public.staff              enable row level security;
alter table public.notifications      enable row level security;

-- Allow all operations via anon key
create policy "Allow all for anon" on public.settings           for all using (true) with check (true);
create policy "Allow all for anon" on public.users              for all using (true) with check (true);
create policy "Allow all for anon" on public.restaurant_tables  for all using (true) with check (true);
create policy "Allow all for anon" on public.menu_items         for all using (true) with check (true);
create policy "Allow all for anon" on public.orders             for all using (true) with check (true);
create policy "Allow all for anon" on public.kots               for all using (true) with check (true);
create policy "Allow all for anon" on public.reservations       for all using (true) with check (true);
create policy "Allow all for anon" on public.inventory          for all using (true) with check (true);
create policy "Allow all for anon" on public.sales              for all using (true) with check (true);
create policy "Allow all for anon" on public.expenses           for all using (true) with check (true);
create policy "Allow all for anon" on public.staff              for all using (true) with check (true);
create policy "Allow all for anon" on public.notifications      for all using (true) with check (true);

-- Done! Your database is ready.

