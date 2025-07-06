-- GAMIFICATION SYSTEM CLEAN MIGRATION
-- Drops and recreates all gamification-related tables and columns for a fresh start

-- 1. DROP TABLES (order matters due to foreign keys)
drop table if exists user_purchases cascade;
drop table if exists user_badges cascade;
drop table if exists gamification_events cascade;
drop table if exists store_items cascade;
drop table if exists badges cascade;

-- 2. BADGES TABLE
create table public.badges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  icon_url text,
  points_required integer not null default 0,
  category text not null, -- e.g. 'achievement', 'participation', 'milestone', 'special'
  rarity text not null,   -- e.g. 'common', 'rare', 'epic', 'legendary'
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

-- 3. USER BADGES TABLE
create table public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  badge_id uuid references public.badges(id) on delete cascade,
  earned_at timestamptz not null default now()
);

-- 4. STORE ITEMS TABLE
create table public.store_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  icon_url text,
  price integer not null default 0,
  item_type text not null, -- e.g. 'avatar_frame', 'profile_background', etc.
  is_active boolean not null default true,
  stock_quantity integer not null default -1, -- -1 means unlimited
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

-- 5. USER PURCHASES TABLE
create table public.user_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  item_id uuid references public.store_items(id) on delete cascade,
  quantity integer not null default 1,
  total_cost integer not null default 0,
  purchased_at timestamptz not null default now()
);

-- 6. GAMIFICATION EVENTS TABLE
create table public.gamification_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  event_type text not null,
  points_earned integer not null default 0,
  coins_earned integer not null default 0,
  description text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- 7. ADD GAMIFICATION COLUMNS TO USERS TABLE
alter table public.users
  add column if not exists points integer not null default 0,
  add column if not exists coins integer not null default 0,
  add column if not exists current_streak integer not null default 0,
  add column if not exists longest_streak integer not null default 0,
  add column if not exists last_active_date timestamptz,
  add column if not exists avatar_url text;

-- 8. INDEXES FOR PERFORMANCE
create index if not exists idx_user_badges_user_id on public.user_badges(user_id);
create index if not exists idx_user_badges_badge_id on public.user_badges(badge_id);
create index if not exists idx_user_purchases_user_id on public.user_purchases(user_id);
create index if not exists idx_user_purchases_item_id on public.user_purchases(item_id);
create index if not exists idx_gamification_events_user_id on public.gamification_events(user_id);

-- 9. DEFAULT BADGE AND STORE ITEM
insert into public.badges (id, name, description, points_required, category, rarity, is_active)
values (gen_random_uuid(), 'First Course', 'Complete your first course', 10, 'achievement', 'common', true)
on conflict do nothing;

insert into public.store_items (id, name, description, price, item_type, is_active, stock_quantity)
values (gen_random_uuid(), 'Gold Avatar Frame', 'A shiny gold frame for your profile picture', 100, 'avatar_frame', true, -1)
on conflict do nothing; 