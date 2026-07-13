-- 名前の重複ログインを防ぐため、profiles.name（大文字小文字を無視）にユニーク制約を追加
create unique index if not exists profiles_name_unique on profiles (lower(name));
