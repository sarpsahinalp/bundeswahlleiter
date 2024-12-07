package db.in.tum.de.datenbanken.Logic;

import db.in.tum.de.datenbanken.schema.erststimme.Erststimme;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

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

    @Query(value = """
        SELECT id, name
        FROM wahlkreis;
    """, nativeQuery = true)
    List<Object[]> getWahlkreise();

    @Query(value = """
        WITH stimmen_max AS (
            SELECT max(stimmen)
            FROM erststimme_aggr
            WHERE wahlkreis_id = :wahlkreis_id and jahr = :year
        )
        SELECT k.vorname, k.nachname, p.kurzbezeichnung
        FROM erststimme_aggr ea
        join kandidatur k using (partei_id, wahlkreis_id, jahr)
        join partei p on p.id = k.partei_id
        WHERE ea.wahlkreis_id = :wahlkreis_id
            AND ea.stimmen = (SELECT * FROM stimmen_max)
            AND ea.jahr = :year;
    """, nativeQuery = true)
    List<Object[]> getGewaehltenDirektkandidaten(@Param("year") int year,@Param("wahlkreis_id") int wahlkreis_id);

    @Query(value = """
        SELECT GREATEST(stimmen1.sum, stimmen2.sum) as wahlbeteiligung, gesamt.wahlberechtigte as wahlberechtigte
        FROM (SELECT wahlberechtigte.wahlberechtigte FROM wahlberechtigte WHERE wahlkreis_id = :wahlkreis_id AND jahr = :year) AS gesamt,
             (SELECT SUM(stimmen) AS sum FROM erststimme_aggr WHERE wahlkreis_id = :wahlkreis_id AND jahr = :year) AS stimmen1,
             (SELECT SUM(stimmen) AS sum FROM zweitestimme_aggr WHERE wahlkreis_id = :wahlkreis_id AND jahr = :year) AS stimmen2;
    """, nativeQuery = true)
    List<Object[]> getWahlbeteiligung(int year, long wahlkreis_id);

    @Query(value = """
        WITH vorjahr AS (
                SELECT max(jahr)
                FROM kandidatur
                WHERE jahr < :year
            ),
                stimmen AS (
                SELECT *
                FROM zweitestimme_aggr za
                WHERE za.wahlkreis_id = :wahlkreis_id
            ),
             stimmen_gesamt AS (
                 SELECT sum(stimmen) as gesamtStimmen, jahr
                 FROM stimmen
                 GROUP BY jahr
             ),
             ergebnis AS (
                 SELECT
                     s.partei_id,
                     s.stimmen as Stimmen_Absolut,
                     ((s.stimmen * 1.0 / sg.gesamtStimmen) * 100) as Stimmen_Prozentual,
                     jahr
                 FROM stimmen s
                    JOIN stimmen_gesamt sg using (jahr)
             )
        SELECT
            p.kurzbezeichnung,
            now.Stimmen_Absolut,
            now.Stimmen_Prozentual,
            (now.Stimmen_Absolut - last.Stimmen_Absolut) as Stimmen_Zuwachs_Absolut,
            (now.Stimmen_Prozentual - last.Stimmen_Prozentual) as Stimmen_Zuwachs_Prozentual
        FROM
            (SELECT * FROM ergebnis WHERE jahr = :year) as now
            join partei p on p.id = now.partei_id
            left join (SELECT * FROM ergebnis WHERE jahr = (SELECT * FROM vorjahr)) as last on now.partei_id = last.partei_id;
    """, nativeQuery = true)
    List<Object[]> getWahlkreisUebersicht(int year, int wahlkreis_id);


}
