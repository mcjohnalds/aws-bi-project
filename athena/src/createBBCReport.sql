create or replace view bbc_report as
select title, regexp_replace(isoDate, 'T..:..:...000Z$') as date from bbc
group by title, isoDate