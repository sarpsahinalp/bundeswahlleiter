-- Gets the parties with at least 3 wins in direct mandates
create materialized view IF NOT EXISTS parties_mind3 as
(
select ea.partei_id, ea.jahr
from erststimme_aggr ea
         left join erststimme_aggr ea2 on ea.partei_id != ea2.partei_id
    and ea.wahlkreis_id = ea2.wahlkreis_id
    and ea.stimmen < ea2.stimmen
    and ea.jahr = ea2.jahr
where ea2.partei_id is null
group by ea.partei_id, ea.jahr
having count(*) >= 3);

-- Gets the votes needed for the 5% threshold
create materialized view IF NOT EXISTS Fünprozentklausel AS
(
SELECT jahr, round(sum(stimmen) * 0.05) AS vote_threshold
FROM zweitestimme_aggr
group by jahr);

-- Gets the parties that have at least 5% of the votes or have at least 3 direct mandates
create materialized view IF NOT EXISTS gultigeparties as
(
select parties_mind3.partei_id, parties_mind3.jahr
from parties_mind3
union
select partei_id, jahr
from zweitestimme_aggr
group by partei_id, jahr
having
    sum(stimmen) >= (select Fünprozentklausel.vote_threshold from Fünprozentklausel where jahr = zweitestimme_aggr.jahr)
union
select m.partei_id, 2021
from minderheitspartei m
    );

-- Gets the Zweitestimme pro party and bundesland
create materialized view IF NOT EXISTS sumZweiteStimmeProParteiInBundesland as
(
SELECT gp.partei_id,
       b.id                         AS bundesland,
       gp.jahr,
       COALESCE(SUM(za.stimmen), 0) AS gesamtStimmen
FROM (SELECT DISTINCT partei_id, jahr FROM gultigeparties) gp
         CROSS JOIN
     bundesland b
         LEFT JOIN
     wahlkreis w ON w.bundesland_id = b.id
         LEFT JOIN
     zweitestimme_aggr za ON za.wahlkreis_id = w.id
         AND za.partei_id = gp.partei_id
         AND za.jahr = gp.jahr
GROUP BY gp.partei_id, b.id, gp.jahr
    );

-- Gets the direct wins in each Wahlkreis
create materialized view IF NOT EXISTS directmandate as
(
select e.wahlkreis_id, e.partei_id, e.jahr
from erststimme_aggr e
where e.stimmen = (select max(e2.stimmen)
                   from erststimme_aggr e2
                   where e2.wahlkreis_id = e.wahlkreis_id
                     and e2.jahr = e.jahr));

-- Sitze pro Wahlkreis
create materialized view IF NOT EXISTS wahlkreisSitze as
(
SELECT b.id                  AS bundesland_id,
       y.jahr,
       p.id                  AS partei_id,
       COUNT(d.wahlkreis_id) AS wahlkreisSitze
FROM (SELECT DISTINCT jahr FROM directmandate) y
         CROSS JOIN partei p
         CROSS JOIN bundesland b
         LEFT JOIN wahlkreis w ON b.id = w.bundesland_id
         LEFT JOIN directmandate d
                   ON w.id = d.wahlkreis_id
                       AND d.jahr = y.jahr
                       AND d.partei_id = p.id
GROUP BY b.id, y.jahr, p.id
    );

-- Bestimmung Uberhang mit 2021 verfahren
create materialized view IF NOT EXISTS uberhangAndMindestsiztanzahl2021 as
(
select w.partei_id,
       w.jahr,
       w.bundesland_id,
       (case
            when w.wahlkreisSitze - coalesce(eu.sitze, 0) > 0 then w.wahlkreisSitze - eu.sitze
            else 0 end)                                                       as drohendeUberhang,
       (case
            when w.wahlkreisSitze >= round((w.wahlkreisSitze + coalesce(eu.sitze, 0)) / 2.0) then w.wahlkreisSitze
            else round((w.wahlkreisSitze + coalesce(eu.sitze, 0)) / 2.0) end) as mindesSitzAnspruch
from wahlkreisSitze w
         left join erste_unterverteilung eu on w.bundesland_id = eu.bundesland_id
    and w.partei_id = eu.partei_id
    and w.jahr = eu.jahr
where w.jahr = 2021
    );

create materialized view IF NOT EXISTS uberhangAndMindestsiztanzahl2017 as
(
select w.partei_id,
       w.jahr,
       w.bundesland_id,
       (case
            when w.wahlkreisSitze - coalesce(eu.sitze, 0) > 0 then w.wahlkreisSitze - eu.sitze
            else 0 end)                                                       as drohendeUberhang,
       (case
            when w.wahlkreisSitze >= coalesce(eu.sitze, 0) then w.wahlkreisSitze
            else coalesce(eu.sitze, 0) end) as mindesSitzAnspruch
from wahlkreisSitze w
         left join erste_unterverteilung eu on w.bundesland_id = eu.bundesland_id
    and w.partei_id = eu.partei_id
    and w.jahr = eu.jahr
where w.jahr = 2017
    );