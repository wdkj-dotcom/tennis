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
  status text not null default 'tentative'
    check (status in ('tentative', 'confirmed', 'cancelled')),
  created_by uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- 特定メンバーだけに公開する日程の許可リスト。
-- ある日程についてここに1件でも行があれば「リストにあるメンバー（＋幹事）だけに表示」、
-- 1件もなければ「全員に表示」という扱いにする。
create table if not exists event_visibility (
  event_id uuid not null references events(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  primary key (event_id, profile_id)
);

create table if not exists rsvps (
  event_id uuid not null references events(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  status text not null check (status in ('attending', 'not_attending', 'pending')),
  updated_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

alter table profiles disable row level security;
alter table events disable row level security;
alter table event_visibility disable row level security;
alter table rsvps disable row level security;
