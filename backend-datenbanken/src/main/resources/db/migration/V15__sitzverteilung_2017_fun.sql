-- Year 2017

-- Erste Oberverteilung
CALL calculate_divisor_erste_oberverteilung(598, 2017);

-- Erste Unterverteilung
CALL calculate_all_unterverteilung(2017);

create materialized view IF NOT EXISTS uberhangAndMindestsiztanzahl2017 as
(
select w.partei_id,
       w.jahr,
       w.bundesland_id,
       GREATEST(w.wahlkreisSitze - coalesce(eu.sitze, 0), 0) as drohendeUberhang,
       GREATEST(w.wahlkreissitze, coalesce(eu.sitze, 0))                  as mindesSitzAnspruch
from wahlkreisSitze w
         left join erste_unterverteilung eu on w.bundesland_id = eu.bundesland_id
    and w.partei_id = eu.partei_id
    and w.jahr = eu.jahr
where w.jahr = 2017
    );

-- Bestimmung der zweite oberverteilung
CREATE OR REPLACE PROCEDURE calculate_divisor_min_seat_claims_2017()
    AS
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
CALL calculate_divisor_min_seat_claims_2017();

-- Zweite Unterverteilung
CALL calculate_zweite_unterverteilung(2017);