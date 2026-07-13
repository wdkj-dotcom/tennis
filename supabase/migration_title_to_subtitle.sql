-- タイトルを「日付＋開始〜終了時間」から自動生成する方式に変更し、
-- 自由入力の title 列を任意入力の subtitle 列に置き換える。
alter table events rename column title to subtitle;
alter table events alter column subtitle drop not null;
