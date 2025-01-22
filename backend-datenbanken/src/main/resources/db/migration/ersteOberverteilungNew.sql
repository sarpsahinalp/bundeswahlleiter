with recursive
    pop_sum AS (SELECT SUM(b.bevoelkerung)::FLOAT AS total_pop
                FROM bevoelkerung b
                WHERE b.jahr = 2021),
    divisorSpanne as (
        -- 1. Berechnungsschritt – Ermittlung des Anfangsdivisors:
        (SELECT 0                     as iteration,
                b.bundesland_id,
                (ps.total_pop / 598.0) as divisor,
                round(b.bevoelkerung / (ps.total_pop / 598.0)) as seats,
                sum(round(b.bevoelkerung / (ps.total_pop / 598.0))) OVER() as sumSeats
         from pop_sum ps, bevoelkerung b
         where b.jahr = 2021)
        UNION ALL
        (
            with nextStep as (
            SELECT ds.iteration + 1 as iteration,
                   ds.bundesland_id,
                    (b.bevoelkerung / CASE WHEN ds.sumSeats > 598 then ds.seats - 0.5 else ds.seats + 0.5 END ) as divisor
            FROM divisorSpanne ds join bevoelkerung b on b.bundesland_id = ds.bundesland_id
            where b.jahr = 2021 and ds.sumSeats != 598),
                chooseDivisor as (
            select divisor, RANK() OVER (ORDER BY divisor DESC) AS rank
            from nextStep
        ), firstRank as (
            select *
            from chooseDivisor
            where rank = 1
            )

            select
                ds.iteration,
                ds.bundesland_id,
                f.divisor,
                round(b.bevoelkerung / f.divisor) as seats,
                sum(round(b.bevoelkerung / f.divisor)) OVER() as sumSeats
            from firstRank f, nextStep ds join bevoelkerung b on b.bundesland_id = ds.bundesland_id
            where b.jahr = 2021
        ))

select *
from divisorSpanne
where iteration = (select max(iteration) from divisorSpanne);
--                             UNION ALL
--                             ( with
--                                 SELECT ds.iteration + 1,
--                                         ds.bundesland_id,
--                                         round(b.bevoelkerung / (b.bevoelkerung / CASE WHEN ds.sumSeats > 598 then ds.seats - 0.5 else ds.seats + 0.5 END )) as seats,
--                                         sum(round(b.bevoelkerung / (b.bevoelkerung / CASE WHEN ds.sumSeats > 598 then ds.seats - 0.5 else ds.seats + 0.5 END ))) OVER() as sumSeats
--                                     FROM divisorSpanne ds join bevoelkerung b on b.bundesland_id = ds.bundesland_id
--                                     where b.jahr = 2017 and ds.sumSeats != 598
--         ))
--         UNION ALL
--         (SELECT zwischen.iteration + 1,
--                 zwischen.newDiv,
--                 (select sum(round(b.bevoelkerung / zwischen.newDiv))
--                  from bevoelkerung b
--                  where b.jahr = 2017) as sum,
--                 zwischen.total_pop
--          FROM (SELECT ds.iteration,
--                       CASE
--                           WHEN ds.sumSeats > 598 THEN ds.total_pop / (ds.sumSeats::FLOAT - 0.5)
--                           ELSE ds.total_pop / (ds.sumSeats::FLOAT + 0.5)
--                           END as newDiv,
--                       ds.sumSeats,
--                       ds.total_pop
--                FROM divisorSpanne ds
--                where ds.sumSeats != 598) as zwischen))

SELECT calculate_all_unterverteilung(2017);