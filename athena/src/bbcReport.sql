select title, regexp_replace(isoDate, 'T..:..:...000Z$') as date from bbc
group by title, isoDate
order by date