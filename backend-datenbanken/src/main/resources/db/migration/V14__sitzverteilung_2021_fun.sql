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

create table IF NOT EXISTS zweiter_oberverteilung
(
    partei_id INT,
    sitze     INT,
    jahr      INT,
    primary key (partei_id, jahr)
);

-- Year 2021

-- Divisor erste oberverteilung function
CREATE OR REPLACE PROCEDURE calculate_divisor_erste_oberverteilung(zielWert INT, paramJahr INT)
AS
$$
BEGIN
    -- Using WITH RECURSIVE to calculate the divisor iteratively
    with recursive
        popsum as (
            select sum(b.bevoelkerung) as popSum
            from bevoelkerung b
            where b.jahr = paramJahr
        ),
        initialDivisor as (
            select round(p.popSum / 598.0, 3) as initialDivisor
            from popsum p
        ),
        divisorVerfahren as (
            -- 1.Schritt: Berechnung der Sitzzahl
            select
                0 as iteration,
                b2.bundesland_id,
                i.initialDivisor as divisor,
                round(b2.bevoelkerung / i.initialDivisor) as sitzzahl,
                sum(round(b2.bevoelkerung / i.initialDivisor)) over () as gesamtSitze
            from bevoelkerung b2, initialDivisor i
            where b2.jahr = paramJahr
            -- 2.Schritt: Berechnung des Divisors
            union all
            (
                with withDivisorKandidaten as (
                    select
                        round(b3.bevoelkerung / (case when zielWert > d.gesamtSitze then sitzzahl + 0.5 else sitzzahl - 0.5 end), 3) as divisor,
                        d.gesamtSitze as gesamtSitze,
                        d.iteration + 1 as iteration
                    from divisorVerfahren d
                             join bevoelkerung b3 on d.bundesland_id = b3.bundesland_id and b3.jahr = paramJahr
                    where zielWert != d.gesamtSitze), withSelectedKandidat as (select
                                                                                     w.iteration,
                                                                                     w.divisor,
                                                                                     b5.bundesland_id,
                                                                                     round(b5.bevoelkerung / w.divisor) as sitzzahl,
                                                                                     sum(round(b5.bevoelkerung / w.divisor)) over (partition by w.divisor) as gesamtSitze
                                                                                 from withDivisorKandidaten w, bevoelkerung b5
                                                                                 where b5.jahr = paramJahr)

                select w.iteration,
                       w.bundesland_id,
                       w.divisor,
                       w.sitzzahl,
                       w.gesamtSitze
                from withSelectedKandidat w
                order by abs(w.gesamtSitze - zielWert)
                LIMIT 16
            )), divisor_end as (select d2.divisor as divisor_final
                                    from divisorVerfahren d2
                                    where d2.iteration = (select max(iteration) from divisorVerfahren d3)
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
CREATE OR REPLACE PROCEDURE calculate_all_unterverteilung(param_jahr INT)
AS $$
    WITH RECURSIVE bundesland_data AS (
    SELECT
        eov.bundesland_id,
        eov.sitze::float AS zielwert,
        SUM(sz.gesamtstimmen) AS total_stimmen
    FROM erste_oberverteilung eov
             JOIN sumzweitestimmeproparteiinbundesland sz
                  ON sz.bundesland = eov.bundesland_id
                      AND sz.jahr = eov.jahr
    WHERE eov.jahr = 2021
    GROUP BY eov.bundesland_id, eov.sitze
), initialDivisor as (
    select bd.bundesland_id,
           (bd.total_stimmen / bd.zielwert)::numeric as initial_divisor
        from bundesland_data bd
), divisor_calculation AS (
                   SELECT
                       0 AS iteration,
                       sz.bundesland,
                       sz.partei_id,
                       id.initial_divisor as divisor,
                       round(sz.gesamtstimmen / id.initial_divisor) AS current_seats,
                       sum(round(sz.gesamtstimmen / id.initial_divisor)) over (partition by bundesland) AS total_seats,
                       eo.sitze as zielWert
                   FROM sumzweitestimmeproparteiinbundesland sz
                       join initialDivisor id
                   on sz.bundesland = id.bundesland_id
                   join erste_oberverteilung eo on eo.bundesland_id = sz.bundesland and eo.jahr = sz.jahr
                   where sz.jahr = param_jahr
                       union all (with divisorKandidaten as (
                select
                    (case when dc.zielwert > dc.total_seats then dc.current_seats + 0.5 else dc.current_seats - 0.5 end) as schritt,
                    sz.gesamtstimmen / (case when dc.zielwert > dc.total_seats then dc.current_seats + 0.5 else dc.current_seats - 0.5 end) as divisor,
                    dc.bundesland as bundesland,
                    dc.partei_id as partei_id,
                    dc.zielWert as zielWert,
                    dc.total_seats as total_seats,
                    dc.iteration + 1 as iteration,
                    sz.gesamtstimmen as zweitstimmen
                from divisor_calculation dc
                join sumzweitestimmeproparteiinbundesland sz
                    on sz.bundesland = dc.bundesland
                           and sz.partei_id = dc.partei_id
                           and sz.jahr = param_jahr
                where dc.total_seats != dc.zielwert
            ), withSelectedKandidat as (
                select
                    dk.iteration,
                    sz.bundesland,
                    sz.partei_id,
                    sz.gesamtstimmen,
                    dk.divisor,
                    round(sz.gesamtstimmen / dk.divisor) AS current_seats,
                    sum(round(sz.gesamtstimmen / dk.divisor)) over (partition by dk.divisor, dk.partei_id) as total_seats,
                    dk.zielWert
                from divisorKandidaten dk, sumzweitestimmeproparteiinbundesland sz
                where dk.schritt > 0
                  and dk.bundesland = sz.bundesland
                and dk.divisor > 0
                and sz.jahr = param_jahr
            ), ranking as (
                select
                    w.iteration,
                    w.divisor,
                    w.bundesland,
                    w.partei_id,
                    w.zielWert,
                    w.current_seats,
                    w.total_seats,
                    rank() over (partition by w.bundesland order by abs(w.total_seats - w.zielWert)) as r
                from withSelectedKandidat w
            )

            select w.iteration,
                   w.bundesland,
                   w.partei_id,
                   w.divisor,
                   w.current_seats,
                   w.total_seats,
                   w.zielWert
            from ranking w
            where r = 1
    )), final_divisors AS (
        SELECT distinct on (d.bundesland)
            d.bundesland,
            d.divisor AS final_divisor
        FROM divisor_calculation d
        where d.iteration = (select max(iteration) from divisor_calculation d2
                             where d.bundesland = d2.bundesland))

INSERT INTO erste_unterverteilung (bundesland_id, partei_id, sitze, jahr)
SELECT
    sz.bundesland,
    sz.partei_id,
    GREATEST(ROUND(sz.gesamtstimmen / fd.final_divisor), 0) AS sitze,
    param_jahr
FROM sumzweitestimmeproparteiinbundesland sz
         JOIN final_divisors fd
              ON fd.bundesland = sz.bundesland
WHERE sz.jahr = param_jahr
ON CONFLICT (bundesland_id, partei_id, jahr)
    DO UPDATE SET sitze = EXCLUDED.sitze;
$$ LANGUAGE SQL;

-- Erste Oberverteilung
CALL calculate_divisor_erste_oberverteilung(598, 2021);

-- Erste Unterverteilung
CALL calculate_all_unterverteilung(2021);


-- Zweite Oberverteilung
-- Bestimmung Uberhang
create materialized view IF NOT EXISTS uberhangAndMindestsiztanzahl2021 as
(
select w.partei_id,
       w.jahr,
       w.bundesland_id,
       GREATEST(w.wahlkreisSitze - coalesce(eu.sitze, 0), 0) as drohendeUberhang,
        GREATEST(w.wahlkreisSitze, round((w.wahlkreisSitze + coalesce(eu.sitze, 0)) / 2.0))               as mindesSitzAnspruch
from wahlkreisSitze w
         left join erste_unterverteilung eu on w.bundesland_id = eu.bundesland_id
    and w.partei_id = eu.partei_id
    and w.jahr = eu.jahr
where w.jahr = 2021
    );


-- Bestimmung der zweite oberverteilung
CREATE or replace PROCEDURE calculate_divisor_min_seat_claims(paramJahr INT)
AS
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
                               where jahr = paramJahr
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
                                   where jahr = paramJahr
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
    select b.partei_id, b.sitzeNachErhohung, paramJahr
    from berechnung_neu_sitze_pro_partei b
    ON CONFLICT (partei_id, jahr)
        DO UPDATE SET sitze = EXCLUDED.sitze;


END;
$$ LANGUAGE plpgsql;

-- Calculates the zweite oberverteilung and inserts into the table
CALL calculate_divisor_min_seat_claims(2021);

create table IF NOT EXISTS zweite_unterverteilung
(
    partei_id INT references partei (id),
    divisor   FLOAT,
    jahr      INT,
    primary key (partei_id, jahr)
);

-- Zweite Unterverteilung
CREATE OR REPLACE PROCEDURE calculate_zweite_unterverteilung(paramJahr INT)
AS
$$
    BEGIN
        with recursive bundesland_data AS (
            SELECT
                eov.partei_id,
                eov.sitze::float AS zielwert,
                SUM(sz.gesamtstimmen) AS total_stimmen
            FROM zweiter_oberverteilung eov
                     JOIN sumzweitestimmeproparteiinbundesland sz
                          ON sz.partei_id = eov.partei_id
                              AND sz.jahr = eov.jahr
            WHERE eov.jahr = paramJahr
            GROUP BY eov.partei_id, eov.sitze
        ), initialDivisor as (
            select bd.partei_id,
                   (bd.total_stimmen / bd.zielwert)::numeric as initial_divisor
            from bundesland_data bd
        ), divisorVerfahren as (
            select 0 as iteration,
                   sz.bundesland,
                   sz.partei_id,
                   id.initial_divisor as divisor,
                   GREATEST(round(sz.gesamtstimmen / id.initial_divisor), eo.wahlkreissitze) AS current_seats,
                   sum(GREATEST(round(sz.gesamtstimmen / id.initial_divisor), eo.wahlkreissitze)) over (partition by eo.partei_id) AS total_seats,
                   zo.sitze as zielWert
            from sumzweitestimmeproparteiinbundesland sz
                     join initialDivisor id
                          on sz.partei_id = id.partei_id
                     join wahlkreissitze eo on eo.partei_id = sz.partei_id and eo.jahr = sz.jahr
                and sz.bundesland = eo.bundesland_id
                     join zweiter_oberverteilung zo on zo.partei_id = sz.partei_id and zo.jahr = sz.jahr
            where sz.jahr = paramJahr

            union all ( with divisorKandidaten as (select (case
                                                               when dc.zielwert > dc.total_seats then dc.current_seats + 0.5
                                                               else dc.current_seats - 0.5 end) as schritt,
                                                          (sz.gesamtstimmen / (case
                                                                                  when dc.zielwert > dc.total_seats then dc.current_seats + 0.5
                                                                                  else dc.current_seats - 0.5 end)) + 1  as divisor,
                                                          dc.bundesland                                              as bundesland,
                                                          dc.partei_id                                               as partei_id,
                                                          dc.zielWert                                                as zielWert,
                                                          dc.total_seats                                             as total_seats,
                                                          dc.iteration + 1                                           as iteration,
                                                          sz.gesamtstimmen                                           as zweitstimmen
                                                   from divisorVerfahren dc
                                                            join sumzweitestimmeproparteiinbundesland sz
                                                                 on sz.partei_id = dc.partei_id
                                                                     and sz.bundesland = dc.bundesland
                                                                     and sz.jahr = paramJahr
                                                   where dc.total_seats != dc.zielwert), rec as (
                select dk.iteration,
                       sz.bundesland,
                       sz.gesamtstimmen,
                       dk.partei_id,
                       dk.divisor,
                       GREATEST(round(sz.gesamtstimmen / dk.divisor), w.wahlkreissitze) as current_seats,
                       sum(GREATEST(round(sz.gesamtstimmen / dk.divisor), w.wahlkreissitze)) over (partition by dk.divisor, sz.partei_id) as total_seats,
                       dk.zielWert
                from divisorKandidaten dk, sumzweitestimmeproparteiinbundesland sz, wahlkreissitze w
                where dk.schritt > 0
                  and dk.divisor > 0
                  and sz.jahr = paramJahr
                  and dk.partei_id = sz.partei_id
                  and w.bundesland_id = sz.bundesland
                  and w.partei_id = sz.partei_id
                  and w.jahr = sz.jahr
            ), ranking as (
                select r.iteration,
                       r.bundesland,
                       r.partei_id,
                       r.divisor,
                       r.current_seats,
                       r.total_seats,
                       r.zielWert,
                       rank() over (partition by r.partei_id order by abs(r.total_seats - r.zielWert)) as r
                from rec r
            )

                        select r.iteration,
                               r.bundesland,
                               r.partei_id,
                               r.divisor,
                               r.current_seats,
                               r.total_seats,
                               r.zielWert
                        from ranking r
                        where r = 1

            )), final_divisors AS (
            SELECT distinct on (d.partei_id)
                d.partei_id,
                d.divisor AS final_divisor
            FROM divisorVerfahren d
            where d.iteration = (select max(iteration) from divisorVerfahren d2
                                 where d.partei_id = d2.partei_id))

        insert
        into zweite_unterverteilung (partei_id, divisor, jahr)
        select i.partei_id, i.final_divisor, paramJahr
        from final_divisors i
        ON CONFLICT (partei_id, jahr)
            DO UPDATE SET divisor = EXCLUDED.divisor;
    END
$$ LANGUAGE plpgsql;

CALL calculate_zweite_unterverteilung(2021);
