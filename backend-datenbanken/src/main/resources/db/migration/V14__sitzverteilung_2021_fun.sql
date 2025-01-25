create table IF NOT EXISTS verteilungskriterium
(
    id      SERIAL PRIMARY KEY,
    name    VARCHAR(255) NOT NULL,
    sitze   INT          NOT NULL,
    divisor FLOAT        NOT NULL
);

create table IF NOT EXISTS erste_oberverteilung
(
    bundesland_id INT references bundesland (id),
    sitze         INT,
    jahr          INT,
    primary key (bundesland_id, jahr)
);

create table IF NOT EXISTS erste_unterverteilung
(
    bundesland_id INT references bundesland (id),
    partei_id     INT references partei (id),
    sitze         INT,
    jahr          INT,
    primary key (bundesland_id, partei_id, jahr)
);

create table IF NOT EXISTS mindestSitzanspruch
(
    bundesland_id      INT references bundesland (id),
    partei_id          INT references partei (id),
    sitze              INT,
    jahr               INT,
    drohendeUberhang   INT,
    mindesSitzAnspruch INT,
    primary key (bundesland_id, partei_id, jahr)
);

create table IF NOT EXISTS zweiter_oberverteilung
(
    partei_id INT,
    sitze     INT,
    jahr      INT,
    primary key (partei_id, jahr)
);

-- Year 2021

-- Divisor erste oberverteilung function
-- TODO: Turn this to procedure and optimize according to finding the lowest boundry
CREATE
    OR REPLACE FUNCTION calculate_divisor_erste_oberverteilung(divisorParam FLOAT, zielWert INT, paramJahr INT)
    RETURNS VOID AS
$$
BEGIN
    -- Using WITH RECURSIVE to calculate the divisor iteratively
    WITH RECURSIVE
        divisor_verfahren (divisor, sitzeverteilt, iteration) AS (
            -- Base case: initial values
            (SELECT divisorParam,
                    (SELECT sum(round(b.bevoelkerung / divisorParam))
                     FROM bevoelkerung b
                     WHERE b.jahr = paramJahr) AS sitze,
                    0                          AS iteration)
            UNION
            -- Recursive case: updating the divisor based on previous iteration
            (SELECT CASE
                        WHEN (zielwert - vk.sitzeverteilt) > 0 THEN vk.divisor * 0.95
                        ELSE vk.divisor * 1.05
                        END                    AS divisor,
                    (SELECT sum(round(b.bevoelkerung / vk.divisor))
                     FROM bevoelkerung b
                     WHERE b.jahr = paramJahr) AS sitze,
                    vk.iteration + 1           AS iteration
             FROM divisor_verfahren vk
             WHERE vk.sitzeverteilt != zielwert)),
        divisor_end as (SELECT vk.divisor as divisor_final
                        FROM divisor_verfahren vk
                        WHERE iteration = (select max(iteration) from divisor_verfahren)
                        LIMIT 1)

    -- Assign the result from the final iteration of the recursive query
    INSERT
    INTO erste_oberverteilung (bundesland_id, sitze, jahr)
    select b.bundesland_id, round(b.bevoelkerung / d.divisor_final) as sitze, paramJahr
    from bevoelkerung b,
         divisor_end d
    where b.jahr = paramJahr
    ON CONFLICT (bundesland_id, jahr)
        DO UPDATE SET sitze = EXCLUDED.sitze;
END;
$$ LANGUAGE plpgsql;

-- Divisor erste unterverteilung function
CREATE OR REPLACE FUNCTION calculate_all_unterverteilung(param_jahr INT)
    RETURNS VOID AS $$
WITH RECURSIVE bundesland_data AS (
    SELECT
        eov.bundesland_id,
        eov.sitze AS zielwert,
        SUM(sz.gesamtstimmen)::FLOAT AS total_stimmen
    FROM erste_oberverteilung eov
             JOIN sumzweitestimmeproparteiinbundesland sz
                  ON sz.bundesland = eov.bundesland_id
                      AND sz.jahr = eov.jahr
    WHERE eov.jahr = param_jahr
    GROUP BY eov.bundesland_id, eov.sitze
),
               divisor_calculation AS (
                   SELECT
                       bd.bundesland_id,
                       bd.zielwert,
                       bd.total_stimmen / bd.zielwert AS initial_divisor,
                       bd.total_stimmen,
                       0 AS iteration
                   FROM bundesland_data bd

                   UNION ALL

                   SELECT
                       dc.bundesland_id,
                       dc.zielwert,
                       CASE
                           WHEN current_seats < dc.zielwert THEN dc.initial_divisor * 0.95
                           ELSE dc.initial_divisor * 1.05
                           END,
                       dc.total_stimmen,
                       dc.iteration + 1
                   FROM divisor_calculation dc
                            CROSS JOIN LATERAL (
                       SELECT SUM(ROUND(sz.gesamtstimmen / dc.initial_divisor)) AS current_seats
                       FROM sumzweitestimmeproparteiinbundesland sz
                       WHERE sz.bundesland = dc.bundesland_id
                         AND sz.jahr = param_jahr
                       ) seats
                   WHERE dc.iteration < 50  -- Safety limit
                     AND current_seats != dc.zielwert
               ),
               final_divisors AS (
                   SELECT DISTINCT ON (bundesland_id)
                       bundesland_id,
                       initial_divisor AS final_divisor
                   FROM divisor_calculation
                   ORDER BY bundesland_id, iteration DESC
               )
INSERT INTO erste_unterverteilung (bundesland_id, partei_id, sitze, jahr)
SELECT
    sz.bundesland,
    sz.partei_id,
    GREATEST(ROUND(sz.gesamtstimmen / fd.final_divisor), 0) AS sitze,
    param_jahr
FROM sumzweitestimmeproparteiinbundesland sz
         JOIN final_divisors fd
              ON fd.bundesland_id = sz.bundesland
WHERE sz.jahr = param_jahr
ON CONFLICT (bundesland_id, partei_id, jahr)
    DO UPDATE SET sitze = EXCLUDED.sitze;
$$ LANGUAGE SQL;

-- Erste Oberverteilung
select calculate_divisor_erste_oberverteilung(
        (select sum(b.bevoelkerung) / 598.0 from bevoelkerung b where b.jahr = 2021), 598, 2021);

-- Erste Unterverteilung
select calculate_all_unterverteilung(2021);


-- Zweite Oberverteilung
-- Bestimmung Uberhang
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


-- Bestimmung der zweite oberverteilung
CREATE
    OR REPLACE FUNCTION calculate_divisor_min_seat_claims()
    RETURNS VOID AS
$$
BEGIN
    with recursive
        mindestSitzDrohendUberhangProPartei as (select u.partei_id,
                                                       sum(u.drohendeUberhang)   as drohenderUberhang,
                                                       sum(u.mindesSitzAnspruch) as mindesSitzAnspruch
                                                from uberhangAndMindestsiztanzahl2021 u
                                                group by u.partei_id),
        mindestSitzMaximum as (select partei_id, sum(sitze) as mindestSitzAnspruch
                               from erste_unterverteilung
                               where jahr = 2021
                               group by partei_id),
        maximumSitzAnspruch as (select m1.partei_id,
                                       (case
                                            when m1.mindesSitzAnspruch > m2.mindestSitzAnspruch
                                                then m1.mindesSitzAnspruch
                                            else m2.mindestSitzAnspruch end) as mindesSitzAnspruch
                                from mindestSitzDrohendUberhangProPartei m1
                                         join mindestSitzMaximum m2 on m1.partei_id = m2.partei_id),
        gesamtStimmenProPartei as (select za.partei_id, sum(za.gesamtStimmen) as gesamt
                                   from sumzweitestimmeproparteiinbundesland za
                                   where jahr = 2021
                                   group by za.partei_id),
        obergrenze_ohne_uberhang as (select m.partei_id, (g.gesamt / (m.mindestSitzAnspruch - 0.5)) as divisor
                                     from mindestSitzMaximum m,
                                          gesamtStimmenProPartei g,
                                          mindestSitzDrohendUberhangProPartei m2
                                     where m.partei_id = g.partei_id
                                       and m.partei_id = m2.partei_id
                                       and m2.drohenderUberhang > 0),
        obergrenze_mit_uberhang as (select m.partei_id,
                                           g.gesamt                                  as gesamt,
                                           m.mindesSitzAnspruch                      as anspruch,
                                           (g.gesamt / (m.mindesSitzAnspruch - 0.5)) as divisor,
                                           0.5                                       as step
                                    from maximumSitzAnspruch m,
                                         gesamtStimmenProPartei g,
                                         mindestSitzDrohendUberhangProPartei m2
                                    where m.partei_id = g.partei_id
                                      and m.partei_id = m2.partei_id
                                      and m2.drohenderUberhang
                                        > 0

                                    union
                                    select o.partei_id,
                                           o.gesamt,
                                           o.anspruch,
                                           (o.gesamt / (o.anspruch - (o.step + 1))),
                                           o.step + 1 as step
                                    from obergrenze_mit_uberhang o
                                    where o.step < 3),
        minObergrenze as ((select floor(divisor) as divisor
                           from obergrenze_mit_uberhang
                           order by divisor
                           offset 3 limit 1)
                          union
                          (select min(divisor) as divisor
                           from obergrenze_ohne_uberhang)),
        final_divisor as (select min(divisor) as divisor
                          from minObergrenze),
        berechnung_neu_sitze_pro_partei as (select m.partei_id,
                                                   m.mindesSitzAnspruch,
                                                   g.gesamt,
                                                   f.divisor,
                                                   round(g.gesamt / f.divisor) +
                                                   (case
                                                        when m.mindesSitzAnspruch - round(g.gesamt / f.divisor) > 0
                                                            then (m.mindesSitzAnspruch - round(g.gesamt / f.divisor))
                                                        else 0
                                                       end) as sitzeNachErhohung
                                            from maximumSitzAnspruch m,
                                                 gesamtStimmenProPartei g,
                                                 final_divisor f
                                            where m.partei_id = g.partei_id)

    insert
    into zweiter_oberverteilung (partei_id, sitze, jahr)
    select b.partei_id, b.sitzeNachErhohung, 2021
    from berechnung_neu_sitze_pro_partei b
    ON CONFLICT (partei_id, jahr)
        DO UPDATE SET sitze = EXCLUDED.sitze;


END;
$$ LANGUAGE plpgsql;

-- Calculates the zweite oberverteilung and inserts into the table
select *
from calculate_divisor_min_seat_claims();

create table IF NOT EXISTS zweite_unterverteilung
(
    partei_id INT references partei (id),
    divisor   FLOAT,
    jahr      INT,
    primary key (partei_id, jahr)
);

-- Zweite Unterverteilung
with recursive
    anfangDivisor as (select szb.partei_id,
                             sum(szb.gesamtStimmen) / (select zo.sitze
                                                       from zweiter_oberverteilung zo
                                                       where zo.partei_id = szb.partei_id
                                                         and zo.jahr = szb.jahr) ::float as divisor
                      from sumzweitestimmeproparteiinbundesland szb
                      where szb.jahr = 2021
                      group by szb.partei_id, szb.jahr),
    iterations as (select szb.partei_id,
                          szb.jahr,
                          (select divisor
                           from anfangDivisor a
                           where a.partei_id = szb.partei_id) as divisor,
                          (select zo.sitze
                           from zweiter_oberverteilung zo
                           where zo.partei_id = szb.partei_id
                             and zo.jahr = szb.jahr)          as zielWert,
                          (sum(case
                                   when round(szb.gesamtStimmen / (select divisor
                                                                   from anfangDivisor a
                                                                   where a.partei_id = szb.partei_id)) <
                                        m.mindesSitzAnspruch
                                       then m.mindesSitzAnspruch
                                   else round(szb.gesamtStimmen / (select divisor
                                                                   from anfangDivisor a
                                                                   where a.partei_id = szb.partei_id))
                              end))                           as verteilteSitze,
                          0                                   as iteration
                   from sumzweitestimmeproparteiinbundesland szb,
                        uberhangAndMindestsiztanzahl2021 m
                   where m.partei_id = szb.partei_id
                     and m.jahr = szb.jahr
                     and szb.bundesland = m.bundesland_id
                     and szb.jahr = 2021
                   group by szb.partei_id, szb.jahr

                   union all

                   select i.partei_id,
                          i.jahr,
                          case
                              when (i.zielWert - i.verteilteSitze) > 0 then i.divisor * 0.95
                              else i.divisor * 1.05 end        as divisor,
                          i.zielWert,
                          (select (sum(case
                                           when round(szb.gesamtStimmen / i.divisor) <
                                                m.mindesSitzAnspruch
                                               then m.mindesSitzAnspruch
                                           else round(szb.gesamtStimmen / i.divisor)
                              end))
                           from sumzweitestimmeproparteiinbundesland szb,
                                uberhangAndMindestsiztanzahl2021 m
                           where m.partei_id = szb.partei_id
                             and m.jahr = szb.jahr
                             and szb.bundesland = m.bundesland_id
                             and szb.jahr = 2021
                             and szb.partei_id = i.partei_id
                             and szb.jahr = i.jahr
                           group by szb.partei_id, szb.jahr) as verteilteSitze,
                          i.iteration + 1                    as iteration
                   from iterations i
                   where i.verteilteSitze != i.zielWert)
-- Final output

insert
into zweite_unterverteilung (partei_id, divisor, jahr)
select i.partei_id, i.divisor, i.jahr
from iterations i
where i.iteration = (select max(iteration)
                     from iterations i2
                     where i2.partei_id = i.partei_id
                       and i2.jahr = i.jahr)
ON CONFLICT (partei_id, jahr)
    DO UPDATE SET divisor = EXCLUDED.divisor;

