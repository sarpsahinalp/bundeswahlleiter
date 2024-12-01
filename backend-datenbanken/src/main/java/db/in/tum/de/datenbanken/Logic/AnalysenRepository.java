package db.in.tum.de.datenbanken.Logic;

import db.in.tum.de.datenbanken.schema.erststimme.Erststimme;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Collection;
import java.util.List;

@org.springframework.stereotype.Repository

public interface AnalysenRepository extends JpaRepository<Erststimme, Long> {

    @Query(value = "WITH jahr AS (VALUES (:year))," +
            "    summed_votes_zweitstimme AS (" +
            "        SELECT wahlkreis_id,  partei_id, SUM(stimmen) AS total_stimmen" +
            "        FROM zweitestimme_aggr" +
            "        WHERE jahr = (SELECT * FROM jahr)" +
            "        GROUP BY wahlkreis_id, partei_id)," +
            "    max_votes_zweitstimme AS (" +
            "         SELECT wahlkreis_id,  MAX(total_stimmen) AS max_stimmen" +
            "         FROM summed_votes_zweitstimme" +
            "         GROUP BY wahlkreis_id)," +
            "    gewinner_zweitstimme AS (" +
            "        SELECT sv.wahlkreis_id, p.kurzbezeichnung" +
            "        FROM summed_votes_zweitstimme sv" +
            "                 JOIN max_votes_zweitstimme mv ON sv.wahlkreis_id = mv.wahlkreis_id AND sv.total_stimmen = mv.max_stimmen" +
            "                 JOIN partei p ON sv.partei_id = p.id" +
            "        WHERE EXISTS (" +
            "            SELECT 1" +
            "            FROM zweitestimme_aggr za" +
            "            WHERE za.wahlkreis_id = sv.wahlkreis_id AND za.jahr = 2021" +
            "        )" +
            "        GROUP BY sv.wahlkreis_id, p.kurzbezeichnung" +
            "    )," +
            "    summed_votes_erststimme AS (" +
            "        SELECT wahlkreis_id,  partei_id, SUM(stimmen) AS total_stimmen" +
            "        FROM erststimme_aggr" +
            "        WHERE jahr = (SELECT * FROM jahr)" +
            "        GROUP BY wahlkreis_id, partei_id)," +
            "    max_votes_erststimme AS (" +
            "        SELECT wahlkreis_id,  MAX(total_stimmen) AS max_stimmen" +
            "        FROM summed_votes_erststimme" +
            "        GROUP BY wahlkreis_id)," +
            "    gewinner_erststimme AS (" +
            "        SELECT sv.wahlkreis_id, p.kurzbezeichnung" +
            "        FROM summed_votes_erststimme sv" +
            "            JOIN max_votes_erststimme mv ON sv.wahlkreis_id = mv.wahlkreis_id AND sv.total_stimmen = mv.max_stimmen" +
            "            JOIN partei p ON sv.partei_id = p.id" +
            "        WHERE EXISTS (" +
            "            SELECT 1" +
            "            FROM erststimme_aggr za" +
            "            WHERE za.wahlkreis_id = sv.wahlkreis_id AND za.jahr = 2021" +
            "        )" +
            "        GROUP BY sv.wahlkreis_id, p.kurzbezeichnung" +
            "    )" +
            "SELECT w.id, w.name, ge.kurzbezeichnung, gz.kurzbezeichnung " +
            "FROM gewinner_zweitstimme gz" +
            "    join gewinner_erststimme ge on gz.wahlkreis_id = ge.wahlkreis_id" +
            "    join wahlkreis w on gz.wahlkreis_id = w.id;", 
            nativeQuery = true)
    List<Object[]> getWahlkreisSieger(@Param("year") int year);

    @Query(value = """
            select p.kurzbezeichnung, zo.sitze
            FROM zweiter_oberverteilung  zo
            join partei p on p.id = zo.partei_id
            WHERE zo.jahr = :year
            """, nativeQuery = true)
    List<Object[]> getSitzverteilung(@Param("year") int year);

    @Query(value = """
            SELECT
                           CASE
                               WHEN :grouping = 'bundesland' THEN b.name
                               ELSE p.kurzbezeichnung
                           END AS group_field,
                           SUM(u.drohendeuberhang) AS mandates
                       FROM (
                           SELECT *
                           FROM uberhangandmindestsiztanzahl2021
                           UNION
                           SELECT *
                           FROM uberhangandmindestsiztanzahl2017
                       ) AS u
                       JOIN gultigeparties gp ON u.partei_id = gp.partei_id
                       JOIN partei p ON gp.partei_id = p.id
                       JOIN bundesland b ON b.id = u.bundesland_id
                       WHERE u.jahr = :year
                       GROUP BY group_field
            """, nativeQuery = true)
    List<Object[]> getUberhangmandate(int year, String grouping);
}
