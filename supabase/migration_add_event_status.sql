-- 日程に「調整中／開催決定／中止」のステータスを追加する。
-- 既存の日程は見た目が変わらないよう、まとめて「開催決定」扱いにする。
alter table events add column if not exists status text not null default 'tentative'
  check (status in ('tentative', 'confirmed', 'cancelled'));

update events set status = 'confirmed';
