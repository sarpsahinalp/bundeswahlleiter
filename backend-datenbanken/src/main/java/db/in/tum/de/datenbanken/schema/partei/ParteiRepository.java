package db.in.tum.de.datenbanken.schema.partei;

import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ParteiRepository extends JpaRepository<Partei, Long> {

    // TODO Continue with the following!!!!!
    @Query( value = """
            with parties_erstestimme_aggr as (
                select p.id as partei_id, e.wahlkreis_id as wahlkreis_id, count(*) as anzahl_erststimmen
                from Partei p
                join Erststimme e on p.id = e.partei_id
                where e.jahr = :year
                group by p.id, e.wahlkreis_id
            ), parties_mind3 as (
                select p.partei_id
                from parties_erstestimme_aggr p
                left join parties_erstestimme_aggr p2 on p.partei_id != p2.partei_id
                                                  and p.wahlkreis_id = p2.wahlkreis_id
                                                  and p.anzahl_erststimmen < p2.anzahl_erststimmen
                where p2.partei_id is null
                group by p.partei_id, p.wahlkreis_id
                having count(*) >= 3
            ), Fünprozentklausel AS (
                   SELECT round(count(*) * 0.05) AS vote_threshold
                   FROM zweitestimme
            ), parties_zweitestimme_aggr as (
                select p.id as partei_id, z.wahlkreis_id as wahlkreis_id, count(*) as anzahl_zweitstimmen
                from Partei p
                join Zweitestimme z on p.id = z.partei_id
                where z.jahr = :year
                group by p.id, z.wahlkreis_id
            ), parties_zweitstimme_total as (
                select p.partei_id, sum(p.anzahl_zweitstimmen) as anzahl_zweitstimmen
                from parties_zweitestimme_aggr p
                group by p.partei_id
            )

            select *
            from parties_mind3 p
            join parties_zweitstimme_total pz on p.partei_id = pz.partei_id
            join parties_zweitestimme_aggr pz2 on pz.partei_id = pz2.partei_id
            where pz.anzahl_zweitstimmen > (select * from Fünprozentklausel)
            """, nativeQuery = true)
    Long getZweiteStimmeInBundeslandProParty(@Param("year") int year);

    @Query(value = """
    select *
    from Partei p
    """, nativeQuery = true)
    Long getTotalAllocatedSeats(@Param("divisor") double divisor, @Param("bundesland") String bundesland, @Param("year") int year);
}