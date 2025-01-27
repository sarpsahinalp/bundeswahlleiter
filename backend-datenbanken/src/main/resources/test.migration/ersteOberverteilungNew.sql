-- Erste Oberverteilung
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



-- Erste Unterverteilung
WITH RECURSIVE bundesland_data AS (
    SELECT
        eov.bundesland_id,
        eov.sitze::float AS zielwert,
        SUM(sz.gesamtstimmen) AS total_stimmen
    FROM erste_oberverteilung eov
             JOIN sumzweitestimmeproparteiinbundesland sz
                  ON sz.bundesland = eov.bundesland_id
                      AND sz.jahr = eov.jahr
    WHERE eov.jahr = 2017
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
                   where sz.jahr = 2017
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
                           and sz.jahr = 2017
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
                and sz.jahr = 2017
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
    SELECT
        d.bundesland,
        d.divisor AS final_divisor
    FROM divisor_calculation d
    where d.iteration = (select max(iteration) from divisor_calculation d2
                                               where d.bundesland = d2.bundesland)
)

--                    SELECT
--                        dc.bundesland_id,
--                        dc.zielwert,
--                        CASE
--                            WHEN current_seats < dc.zielwert THEN dc.initial_divisor - 10
--                            ELSE dc.initial_divisor + 10
--                            END,
--                        dc.total_stimmen,
--                        dc.iteration + 1
--                    FROM divisor_calculation dc
--                             CROSS JOIN LATERAL (
--                        SELECT SUM(ROUND(sz.gesamtstimmen / dc.initial_divisor)) AS current_seats
--                        FROM sumzweitestimmeproparteiinbundesland sz
--                        WHERE sz.bundesland = dc.bundesland_id
--                          AND sz.jahr = 2021
--                        ) seats
--                    WHERE current_seats != dc.zielwert
--                ),

select *
from final_divisors;


-- Zweite Unterverteilung
with recursive bundesland_data AS (
    SELECT
        eov.partei_id,
        eov.sitze::float AS zielwert,
        SUM(sz.gesamtstimmen) AS total_stimmen
    FROM zweiter_oberverteilung eov
             JOIN sumzweitestimmeproparteiinbundesland sz
                  ON sz.partei_id = eov.partei_id
                      AND sz.jahr = eov.jahr
    WHERE eov.jahr = 2017
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
    where sz.jahr = 2017

        union all ( with divisorKandidaten as (select (case
                                                          when dc.zielwert > dc.total_seats then dc.current_seats + 0.5
                                                          else dc.current_seats - 0.5 end) as schritt,
                                sz.gesamtstimmen / (case
                                                        when dc.zielwert > dc.total_seats then dc.current_seats + 0.5
                                                        else dc.current_seats - 0.5 end)   as divisor,
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
                                           and sz.jahr = 2017
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
    and sz.jahr = 2017
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

select *
from final_divisors;



with recursive bundesland_data AS (
    SELECT
        eov.partei_id,
        eov.sitze::float AS zielwert,
        SUM(sz.gesamtstimmen) AS total_stimmen
    FROM zweiter_oberverteilung eov
             JOIN sumzweitestimmeproparteiinbundesland sz
                  ON sz.partei_id = eov.partei_id
                      AND sz.jahr = eov.jahr
    WHERE eov.jahr = 2021
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
    where sz.jahr = 2021), divisorKandidaten as (select (case
                                                       when dc.zielwert > dc.total_seats then dc.current_seats + 0.5
                                                       else dc.current_seats - 0.5 end) as schritt,
                                                  (sz.gesamtstimmen / (case
                                                                          when dc.zielwert > dc.total_seats then dc.current_seats + 0.5
                                                                          else dc.current_seats - 0.5 end)) + 1 as divisor,
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
                                                             and sz.jahr = 2021
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
          and sz.jahr = 2021
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
    ), divisorKandidaten2 as (
    (select (case
                 when dc.zielwert > dc.total_seats then dc.current_seats + 0.5
                 else dc.current_seats - 0.5 end) as schritt,
            (sz.gesamtstimmen / (case
                                    when dc.zielwert > dc.total_seats then dc.current_seats + 0.5
                                    else dc.current_seats - 0.5 end)) + 1 as divisor,
            dc.bundesland                                              as bundesland,
            dc.partei_id                                               as partei_id,
            dc.zielWert                                                as zielWert,
            dc.total_seats                                             as total_seats,
            dc.iteration + 1                                           as iteration,
            sz.gesamtstimmen                                           as zweitstimmen
     from ranking dc
              join sumzweitestimmeproparteiinbundesland sz
                   on sz.partei_id = dc.partei_id
                       and sz.bundesland = dc.bundesland
                       and sz.jahr = 2021
     where dc.total_seats != dc.zielwert
     and dc.r = 1)
)
--    , final_divisors AS (
--     SELECT distinct on (d.partei_id)
--         d.partei_id,
--         d.divisor AS final_divisor
--     FROM ranking d
--     where d.iteration = (select max(iteration) from ranking d2
--                          where d.partei_id = d2.partei_id)
--     and d.r = 1)

select *
from divisorKandidaten2;