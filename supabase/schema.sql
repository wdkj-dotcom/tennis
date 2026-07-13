-- テニスサークル 日程・参加者管理システム スキーマ
-- Supabase の SQL Editor でこのファイルの内容を実行してください。

-- プロフィール（ユーザーごとの表示名とロール）
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role text not null default 'member' check (role in ('admin', 'member')),
  created_at timestamptz not null default now()
);

-- 練習日程
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date date not null,
  start_time time,
  end_time time,
  location text,
  capacity int,
  note text,
  created_by uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- 参加回答（RSVP）
create table if not exists rsvps (
  event_id uuid not null references events(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  status text not null check (status in ('attending', 'not_attending')),
  updated_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

-- 新規ユーザー登録時に profiles を自動作成
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'member')
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Row Level Security
alter table profiles enable row level security;
alter table events enable row level security;
alter table rsvps enable row level security;

-- profiles: 全員が閲覧可、本人のみ更新可
create policy "profiles_select_all" on profiles for select using (true);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

-- events: 全員が閲覧可、adminのみ作成・更新・削除可
create policy "events_select_all" on events for select using (true);
create policy "events_insert_admin" on events for insert
  with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "events_update_admin" on events for update
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "events_delete_admin" on events for delete
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- rsvps: 全員が閲覧可、本人の回答のみ作成・更新・削除可
create policy "rsvps_select_all" on rsvps for select using (true);
create policy "rsvps_insert_own" on rsvps for insert with check (auth.uid() = user_id);
create policy "rsvps_update_own" on rsvps for update using (auth.uid() = user_id);
create policy "rsvps_delete_own" on rsvps for delete using (auth.uid() = user_id);
