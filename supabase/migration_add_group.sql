-- 日程ごとに「誰が見られるか」を選択できるようにする。
-- event_visibility に行がある日程は、そこに列挙されたメンバー（＋幹事）だけに表示される。
-- 行が1件もない日程は、これまで通り全員に表示される。
create table if not exists event_visibility (
  event_id uuid not null references events(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  primary key (event_id, profile_id)
);

alter table event_visibility disable row level security;
