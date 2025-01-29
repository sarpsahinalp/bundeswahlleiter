REFRESH MATERIALIZED VIEW parties_mind3;
REFRESH MATERIALIZED VIEW fünprozentklausel;
REFRESH MATERIALIZED VIEW gultigeparties;
REFRESH MATERIALIZED VIEW sumZweiteStimmeProParteiInBundesland;
REFRESH MATERIALIZED VIEW directmandate;
REFRESH MATERIALIZED VIEW wahlkreissitze;

-- Erste Oberverteilung
CALL calculate_divisor_erste_oberverteilung(598, :year);

-- Erste Unterverteilung
CALL calculate_all_unterverteilung(:year);

create or replace view uberhangAndMindestsiztanzahl as
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
where w.jahr > 2017
    );

CALL calculate_divisor_min_seat_claims(:year);

-- Zweite Unterverteilung
with recursive
    anfangDivisor as (select szb.partei_id,
                             sum(szb.gesamtStimmen) / (select zo.sitze
                                                       from zweiter_oberverteilung zo
                                                       where zo.partei_id = szb.partei_id
                                                         and zo.jahr = szb.jahr) ::float as divisor
                      from sumzweitestimmeproparteiinbundesland szb
                      where szb.jahr = :year
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
                        uberhangAndMindestsiztanzahl m
                   where m.partei_id = szb.partei_id
                     and m.jahr = szb.jahr
                     and szb.bundesland = m.bundesland_id
                     and szb.jahr = :year
                   group by szb.partei_id, szb.jahr

                   union all

                   select i.partei_id,
                          i.jahr,
                          case
                              when (i.zielWert - i.verteilteSitze) > 0 then i.divisor * 0.99
                              else i.divisor * 1.01 end        as divisor,
                          i.zielWert,
                          (select (sum(case
                                           when round(szb.gesamtStimmen / i.divisor) <
                                                m.mindesSitzAnspruch
                                               then m.mindesSitzAnspruch
                                           else round(szb.gesamtStimmen / i.divisor)
                              end))
                           from sumzweitestimmeproparteiinbundesland szb,
                                uberhangAndMindestsiztanzahl
                                    m
                           where m.partei_id = szb.partei_id
                             and m.jahr = szb.jahr
                             and szb.bundesland = m.bundesland_id
                             and szb.jahr = :year
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