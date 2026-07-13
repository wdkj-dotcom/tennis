-- テニスサークル 日程・参加者管理システム スキーマ
-- 認証はSupabase Authを使わず、アプリ側で名前ベースのCookieセッションを発行する。
-- そのためテーブル操作はすべてサーバー側の service role キー経由で行い、RLSは無効化する。

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null default 'member' check (role in ('admin', 'member')),
  created_at timestamptz not null default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  subtitle text,
  event_date date not null,
  start_time time,
  end_time time,
  location text,
  capacity int,
  note text,
  created_by uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists rsvps (
  event_id uuid not null references events(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  status text not null check (status in ('attending', 'not_attending')),
  updated_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

alter table profiles disable row level security;
alter table events disable row level security;
alter table rsvps disable row level security;
