-- 参加/不参加に加えて「参加保留」ステータスを追加
alter table rsvps drop constraint if exists rsvps_status_check;
alter table rsvps add constraint rsvps_status_check
  check (status in ('attending', 'not_attending', 'pending'));
