-- Year 2017

-- Erste Oberverteilung
select *
from calculate_divisor_erste_oberverteilung(
        (select sum(b.bevoelkerung) / 598.0 from bevoelkerung b where b.jahr = 2017), 598, 2017);

-- Erste Unterverteilung
select *
from calculate_divisor_erste_unterverteilung(1, (select erste_oberverteilung.sitze
                                                 from erste_oberverteilung
                                                 where bundesland_id = 1
                                                   and jahr = 2017), 2017);
select *
from calculate_divisor_erste_unterverteilung(2, (select erste_oberverteilung.sitze
                                                 from erste_oberverteilung
                                                 where bundesland_id = 2
                                                   and jahr = 2017), 2017);
select *
from calculate_divisor_erste_unterverteilung(3, (select erste_oberverteilung.sitze
                                                 from erste_oberverteilung
                                                 where bundesland_id = 3
                                                   and jahr = 2017), 2017);
select *
from calculate_divisor_erste_unterverteilung(4, (select erste_oberverteilung.sitze
                                                 from erste_oberverteilung
                                                 where bundesland_id = 4
                                                   and jahr = 2017), 2017);
select *
from calculate_divisor_erste_unterverteilung(5, (select erste_oberverteilung.sitze
                                                 from erste_oberverteilung
                                                 where bundesland_id = 5
                                                   and jahr = 2017), 2017);
select *
from calculate_divisor_erste_unterverteilung(6, (select erste_oberverteilung.sitze
                                                 from erste_oberverteilung
                                                 where bundesland_id = 6
                                                   and jahr = 2017), 2017);
select *
from calculate_divisor_erste_unterverteilung(7, (select erste_oberverteilung.sitze
                                                 from erste_oberverteilung
                                                 where bundesland_id = 7
                                                   and jahr = 2017), 2017);
select *
from calculate_divisor_erste_unterverteilung(8, (select erste_oberverteilung.sitze
                                                 from erste_oberverteilung
                                                 where bundesland_id = 8
                                                   and jahr = 2017), 2017);
select *
from calculate_divisor_erste_unterverteilung(9, (select erste_oberverteilung.sitze
                                                 from erste_oberverteilung
                                                 where bundesland_id = 9
                                                   and jahr = 2017), 2017);
select *
from calculate_divisor_erste_unterverteilung(10, (select erste_oberverteilung.sitze
                                                  from erste_oberverteilung
                                                  where bundesland_id = 10
                                                    and jahr = 2017), 2017);
select *
from calculate_divisor_erste_unterverteilung(11, (select erste_oberverteilung.sitze
                                                  from erste_oberverteilung
                                                  where bundesland_id = 11
                                                    and jahr = 2017), 2017);
select *
from calculate_divisor_erste_unterverteilung(12, (select erste_oberverteilung.sitze
                                                  from erste_oberverteilung
                                                  where bundesland_id = 12
                                                    and jahr = 2017), 2017);
select *
from calculate_divisor_erste_unterverteilung(13, (select erste_oberverteilung.sitze
                                                  from erste_oberverteilung
                                                  where bundesland_id = 13
                                                    and jahr = 2017), 2017);
select *
from calculate_divisor_erste_unterverteilung(14, (select erste_oberverteilung.sitze
                                                  from erste_oberverteilung
                                                  where bundesland_id = 14
                                                    and jahr = 2017), 2017);
select *
from calculate_divisor_erste_unterverteilung(15, (select erste_oberverteilung.sitze
                                                  from erste_oberverteilung
                                                  where bundesland_id = 15
                                                    and jahr = 2017), 2017);
select *
from calculate_divisor_erste_unterverteilung(16, (select erste_oberverteilung.sitze
                                                  from erste_oberverteilung
                                                  where bundesland_id = 16
                                                    and jahr = 2017), 2017);


-- Bestimmung der zweite oberverteilung
CREATE
    OR REPLACE FUNCTION calculate_divisor_min_seat_claims_2017()
    RETURNS VOID AS
$$
BEGIN
    with recursive
        mindestSitzDrohendUberhangProPartei as (select u.partei_id,
                                                       sum(u.drohendeUberhang)   as drohenderUberhang,
                                                       sum(u.mindesSitzAnspruch) as mindesSitzAnspruch
                                                from uberhangAndMindestsiztanzahl2017 u
                                                group by u.partei_id),
        mindestSitzMaximum as (select partei_id, sum(sitze) as mindestSitzAnspruch
                               from erste_unterverteilung
                               where jahr = 2017
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
                                   where jahr = 2017
                                   group by za.partei_id),
        obergrenze_ohne_uberhang as (select m.partei_id, (g.gesamt / (m.mindesSitzAnspruch - 0.5)) as divisor
                                     from maximumSitzAnspruch m,
                                          gesamtStimmenProPartei g,
                                          mindestSitzDrohendUberhangProPartei m2
                                     where m.partei_id = g.partei_id
                                       and m.partei_id = m2.partei_id
                                       and m2.drohenderUberhang > 0),
        final_divisor as (select round(min(divisor)) as divisor
                          from obergrenze_ohne_uberhang),
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
    select b.partei_id, b.sitzeNachErhohung, 2017
    from berechnung_neu_sitze_pro_partei b
    ON CONFLICT (partei_id, jahr)
        DO UPDATE SET sitze = EXCLUDED.sitze;


END;
$$ LANGUAGE plpgsql;

-- Calculates the zweite oberverteilung and inserts into the table
select *
from calculate_divisor_min_seat_claims_2017();

-- Zweite Unterverteilung
with recursive
    anfangDivisor as (select szb.partei_id,
                             sum(szb.gesamtStimmen) / (select zo.sitze
                                                       from zweiter_oberverteilung zo
                                                       where zo.partei_id = szb.partei_id
                                                         and zo.jahr = szb.jahr) ::float as divisor
                      from sumzweitestimmeproparteiinbundesland szb
                      where szb.jahr = 2017
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
                        uberhangAndMindestsiztanzahl2017 m
                   where m.partei_id = szb.partei_id
                     and m.jahr = szb.jahr
                     and szb.bundesland = m.bundesland_id
                     and szb.jahr = 2017
                   group by szb.partei_id, szb.jahr

                   union all

                   select i.partei_id,
                          i.jahr,
                          case
                              when (i.zielWert - i.verteilteSitze) > 0 then i.divisor - 10
                              else i.divisor + 10 end        as divisor,
                          i.zielWert,
                          (select (sum(case
                                           when round(szb.gesamtStimmen / i.divisor) <
                                                m.mindesSitzAnspruch
                                               then m.mindesSitzAnspruch
                                           else round(szb.gesamtStimmen / i.divisor)
                              end))
                           from sumzweitestimmeproparteiinbundesland szb,
                                uberhangAndMindestsiztanzahl2017 m
                           where m.partei_id = szb.partei_id
                             and m.jahr = szb.jahr
                             and szb.bundesland = m.bundesland_id
                             and szb.jahr = 2017
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
                       and i2.jahr = i.jahr);