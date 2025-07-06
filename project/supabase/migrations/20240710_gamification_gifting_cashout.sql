-- Gamification Gifting & Cashout Migration
-- Adds tables for withdrawal requests, gifts, and coin transactions
-- Alters user_purchases to support gifting

-- 1. Withdrawal Requests Table
create table if not exists public.withdrawal_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  amount_coins integer not null,
  amount_cash numeric(12,2) not null,
  status text not null default 'pending', -- pending, approved, rejected, paid
  payment_method text, -- e.g., 'bank', 'paypal'
  payment_details jsonb, -- e.g., { "account": "...", "bank": "..." }
  requested_at timestamptz not null default now(),
  processed_at timestamptz
);

-- 2. Gifts Table
create table if not exists public.gifts (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references public.users(id) on delete cascade,
  recipient_id uuid references public.users(id) on delete cascade,
  gift_type text not null, -- 'coins' or 'item'
  amount integer, -- for coins
  item_id uuid references public.store_items(id), -- for items
  message text,
  status text not null default 'sent', -- sent, accepted, rejected
  sent_at timestamptz not null default now(),
  accepted_at timestamptz
);

-- 3. Coin Transactions Table
create table if not exists public.coin_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  type text not null, -- 'earn', 'spend', 'gift_sent', 'gift_received', 'cashout'
  amount integer not null,
  related_id uuid, -- e.g., gift id, withdrawal id, store purchase id
  description text,
  created_at timestamptz not null default now()
);

-- 4. Alter user_purchases to support gifting
alter table public.user_purchases
  add column if not exists gifted_by uuid references public.users(id); 