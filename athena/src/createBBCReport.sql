create or replace view bbc_report as
select * from bbc
group by title, date