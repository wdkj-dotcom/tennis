-- 既存プロジェクト向け: メール/パスワード認証 → 名前だけログインへの移行
-- Supabase の SQL Editor でこのファイルの内容を実行してください。

-- 1. auth.users 作成時のトリガー・関数を削除（もう使わない）
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- 2. profiles.id が auth.users を参照している外部キーを削除し、
--    アプリ側で生成したUUIDを直接使えるようにする
alter table profiles drop constraint if exists profiles_id_fkey;
alter table profiles alter column id set default gen_random_uuid();

-- 3. すべてのテーブル操作はサーバー側の service role キー経由で行うため、
--    auth.uid() に依存する既存のRLSポリシーは無効化する
drop policy if exists "profiles_select_all" on profiles;
drop policy if exists "profiles_update_own" on profiles;
drop policy if exists "events_select_all" on events;
drop policy if exists "events_insert_admin" on events;
drop policy if exists "events_update_admin" on events;
drop policy if exists "events_delete_admin" on events;
drop policy if exists "rsvps_select_all" on rsvps;
drop policy if exists "rsvps_insert_own" on rsvps;
drop policy if exists "rsvps_update_own" on rsvps;
drop policy if exists "rsvps_delete_own" on rsvps;

alter table profiles disable row level security;
alter table events disable row level security;
alter table rsvps disable row level security;

-- 4. （任意）これまでメール/パスワードで作成したテスト用ユーザーが不要なら、
--    Authentication > Users 画面から手動で削除してください。
--    profiles テーブルの行は残るので、そのまま名前ログインで使い続けられます。
