package db.in.tum.de.datenbanken.logic;

import db.in.tum.de.datenbanken.schema.voting.VoteCode;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnalysenRepository extends CrudRepository<VoteCode, Long> {

    @Query(value = """
            SELECT :year = any(
                SELECT year
                FROM elections
                WHERE status = 'INACTIVE'
            );
            """, nativeQuery = true)
    List<Object[]> isJahrAllowed(int year);

    @Query(value = """
            SELECT year
            FROM elections
            WHERE status = 'INACTIVE';
            """, nativeQuery = true)
    List<Object[]> getJahre();

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
            "            WHERE za.wahlkreis_id = sv.wahlkreis_id AND za.jahr = :year" +
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
            "            WHERE za.wahlkreis_id = sv.wahlkreis_id AND za.jahr = :year" +
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
            with vorjahr AS (
                    SELECT max(jahr)
                    FROM zweiter_oberverteilung
                    WHERE jahr < :year
                )
            select p.kurzbezeichnung, zo.sitze,
                   (SELECT vorWahl.sitze FROM zweiter_oberverteilung vorWahl WHERE vorWahl.jahr = (SELECT * FROM vorjahr) and vorWahl.partei_id = zo.partei_id)
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
                     JOIN gultigeparties gp using (partei_id, jahr)
                     JOIN partei p ON gp.partei_id = p.id
                     JOIN bundesland b ON b.id = u.bundesland_id
            WHERE u.jahr = :year
            GROUP BY group_field;
            """, nativeQuery = true)
    List<Object[]> getUberhangmandate(int year, String grouping);

    @Query(value = """
                SELECT id, name
                FROM wahlkreis;
            """, nativeQuery = true)
    List<Object[]> getWahlkreise();

    @Query(value = """
                WITH stimmen_Aggregation AS (
                    SELECT wahlkreis_id, partei_id, jahr, stimmen
                    FROM erststimme_aggr
                    WHERE :useAggregation
                    UNION ALL
                    SELECT wahlkreis_id, partei_id, jahr, count(*) as stimmen
                    FROM erststimme
                    WHERE NOT :useAggregation
                    GROUP BY wahlkreis_id, partei_id, jahr
                ),
                    stimmen_max AS (
                    SELECT max(stimmen)
                    FROM stimmen_Aggregation
                    WHERE wahlkreis_id = :wahlkreis_id and jahr = :year
                )
                SELECT k.vorname, k.nachname, p.kurzbezeichnung
                FROM stimmen_Aggregation sA
                         join kandidatur k using (partei_id, wahlkreis_id, jahr)
                         join partei p on p.id = k.partei_id
                WHERE sA.wahlkreis_id = :wahlkreis_id
                  AND sA.stimmen = (SELECT * FROM stimmen_max)
                  AND sA.jahr = :year;
            """, nativeQuery = true)
    List<Object[]> getGewaehltenDirektkandidaten(int year, int wahlkreis_id, boolean useAggregation);

    @Query(value = """
                SELECT GREATEST(stimmen1.sum, stimmen2.sum) as wahlbeteiligung, gesamt.wahlberechtigte as wahlberechtigte
                FROM (SELECT wahlberechtigte.wahlberechtigte FROM wahlberechtigte WHERE wahlkreis_id = :wahlkreis_id AND jahr = :year) AS gesamt,
                     (SELECT SUM(stimmen) AS sum FROM erststimme_aggr WHERE wahlkreis_id = :wahlkreis_id AND jahr = :year) AS stimmen1,
                     (SELECT SUM(stimmen) AS sum FROM zweitestimme_aggr WHERE wahlkreis_id = :wahlkreis_id AND jahr = :year) AS stimmen2
                WHERE :useAggregation
                UNION ALL
                SELECT GREATEST(stimmen1.sum, stimmen2.sum) as wahlbeteilgung, gesamt.wahlberechtigte as wahlberechtigte
                FROM (SELECT wahlberechtigte.wahlberechtigte FROM wahlberechtigte WHERE wahlkreis_id = :wahlkreis_id AND jahr = :year) AS gesamt,
                     (SELECT COUNT(*) AS sum FROM erststimme WHERE wahlkreis_id = :wahlkreis_id AND jahr = :year) AS stimmen1,
                     (SELECT COUNT(*) AS sum FROM zweitestimme WHERE wahlkreis_id = :wahlkreis_id AND jahr = :year) AS stimmen2
                WHERE NOT :useAggregation;
            """, nativeQuery = true)
    List<Object[]> getWahlbeteiligung(int year, long wahlkreis_id, boolean useAggregation);

    @Query(value = """
                WITH stimmen AS (
                      SELECT partei_id, jahr, stimmen
                      FROM zweitestimme_aggr
                      WHERE :useAggregation AND wahlkreis_id = :wahlkreis_id
                      UNION ALL
                      SELECT  partei_id, jahr, count(*) as stimmen
                      FROM zweitestimme
                      WHERE (NOT :useAggregation) AND wahlkreis_id = :wahlkreis_id
                      GROUP BY partei_id, jahr
                  ),vorjahr AS (
                      SELECT max(jahr)
                      FROM kandidatur
                      WHERE jahr < :year
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
    List<Object[]> getWahlkreisUebersicht(int year, int wahlkreis_id, boolean useAggregation);

    @Query(value = """
                WITH RankedVotes AS (
                    SELECT distinct on (e.wahlkreis_id, e.partei_id)
                        e.Wahlkreis_ID,
                        e.Partei_ID,
                        p.kurzbezeichnung,
                        e.Stimmen,
                        RANK() OVER (PARTITION BY e.Wahlkreis_ID ORDER BY e.Stimmen DESC) AS Stimmen_Rang
                    FROM
                        erststimme_aggr e
                            JOIN Partei p ON e.Partei_ID = p.id
                            JOIN kandidatur k ON p.id = k.partei_id and e.wahlkreis_id = k.wahlkreis_id and e.jahr = k.jahr
                    where e.jahr = :year
                      AND NOT p.is_einzelbewerber
                ),
                     Winners AS (
                         -- Extract the winner for each Wahlkreis
                         SELECT
                             r.Wahlkreis_ID,
                             r.Partei_ID AS Gewinner_Partei_ID,
                             r.kurzbezeichnung AS Gewinner_Partei_Name,
                             r.Stimmen AS Gewinner_Stimmen
                         FROM
                             RankedVotes r
                         WHERE
                             r.Stimmen_Rang = 1
                     ),
                     KnappsteSiege AS (
                         SELECT
                             w.Gewinner_Partei_ID AS Partei_ID,
                             w.Gewinner_Partei_Name AS Partei_Name,
                             w.Wahlkreis_ID,
                             w.Gewinner_Stimmen AS Stimmen,
                             w.Gewinner_Stimmen - r.Stimmen AS Differenz,
                             'Sieg' AS Typ
                         FROM
                             Winners w
                                 JOIN
                             RankedVotes r
                             ON w.Wahlkreis_ID = r.Wahlkreis_ID AND r.Stimmen_Rang = 2
                     ),
                     KnappsteNiederlagen AS (
                         SELECT
                             r.Partei_ID,
                             r.kurzbezeichnung,
                             r.Wahlkreis_ID,
                             r.Stimmen AS Stimmen,
                             w.Gewinner_Stimmen - r.Stimmen AS Differenz,
                             'Niederlage' AS Typ
                         FROM
                             RankedVotes r
                                 JOIN
                             Winners w
                             ON r.Wahlkreis_ID = w.Wahlkreis_ID AND r.Partei_ID != w.Gewinner_Partei_ID
                     ),
                     CombinedResults AS (
                         -- Combine victories and losses
                         SELECT * FROM KnappsteSiege
                         UNION ALL
                         SELECT * FROM KnappsteNiederlagen
                     ),
                     RankedResults AS (
                         -- Rank the combined results (victories first, sorted by smallest difference)
                         SELECT
                             Partei_Name,
                             Wahlkreis_ID,
                             Typ,
                             Stimmen,
                             Differenz,
                             rank() OVER (PARTITION BY Partei_Name ORDER BY Typ desc, Differenz) AS Rang
                         FROM
                             CombinedResults
                     )
            
                SELECT
                    r.Partei_Name,
                    w.name,
                    r.Typ,
                    r.Stimmen,
                    r.Differenz,
                    r.Rang
                FROM
                    RankedResults r, wahlkreis w
                WHERE
                    r.wahlkreis_id = w.id
                  and
                    Rang <= 10
            """, nativeQuery = true)
    List<Object[]> getKnappsteSiegerErstStimme(int year);

    @Query(value = """
            with nonVotersErsteStimme as (
                select  ea.wahlkreis_id, wb.wahlberechtigte - ea.stimmen as nonVoters, 'erststimme' as type
                from wahlberechtigte wb join erststimme_aggr ea on ea.wahlkreis_id = wb.wahlkreis_id and ea.jahr = wb.jahr
                where ea.jahr = :year
            ), nonVotersZweiteStimme as (
                select za.wahlkreis_id, wb.wahlberechtigte - za.stimmen as nonVoters, 'zweitstimme' as type
                from wahlberechtigte wb join zweitestimme_aggr za on za.wahlkreis_id = wb.wahlkreis_id and za.jahr = wb.jahr
                where za.jahr = :year
            )
            select w.name, sum(nve.nonVoters), nve.type
            from nonVotersErsteStimme nve join wahlkreis w on nve.wahlkreis_id = w.id
            where nve.type = :erststimme
            group by w.name, nve.type
            union all
            select w.name, sum(nvz.nonVoters), nvz.type
            from nonVotersZweiteStimme nvz join wahlkreis w on nvz.wahlkreis_id = w.id
            where nvz.type = :erststimme
            group by w.name, nvz.type;
            """, nativeQuery = true)
    List<Object[]> getNonVotersProStimmen(int year, String erststimme);

    @Query(value = """
                with sitzProPartei AS(
                        SELECT
                            zu.partei_id,
                            GREATEST(
                                round(gesamtstimmen / divisor),
                                 (SELECT u.mindessitzanspruch FROM uberhangandmindestsiztanzahl2021 u WHERE u.partei_id = s.partei_id and u.jahr = s.jahr and u.bundesland_id = s.bundesland),
                                 (SELECT u.mindessitzanspruch FROM uberhangandmindestsiztanzahl2017 u WHERE u.partei_id = s.partei_id and u.jahr = s.jahr and u.bundesland_id = s.bundesland)
                            ) as sitze
                        FROM zweite_unterverteilung zu
                                 join sumzweitestimmeproparteiinbundesland s using (partei_id, jahr)
                        WHERE jahr = :year and s.bundesland = :bundesland_id
                    ),
                    direktmandate AS (
                        SELECT  k.id as kandidatur_id
                        FROM (
                            SELECT partei_id, wahlkreis_id, ROW_NUMBER() OVER w as rank
                            FROM erststimme_aggr ea join wahlkreis w on ea.wahlkreis_id = w.id
                            WHERE w.bundesland_id = :bundesland_id and jahr = :year
                            WINDOW w as (
                              partition by wahlkreis_id
                              order by stimmen desc
                            )
                        ) AS a
                        join kandidatur k using (partei_id, wahlkreis_id)
                        WHERE rank = :bundesland_id and jahr = :year
                    ),
                    angepasset_kandidaten AS (
                        SELECT k.id as kandidatur_id, vorname, nachname, partei_id, wahlkreis_id,
                            CASE WHEN EXISTS(SELECT * FROM direktmandate d WHERE d.kandidatur_id = k.id)
                                THEN 0 ELSE k.landesliste_platz END as landesliste_platz
                        FROM kandidatur k
                        WHERE jahr = :year and bundesland_id = :bundesland_id
                    ),
                    ranked_kandidaten AS (
                        SELECT *, row_number() over w as rank
                        FROM angepasset_kandidaten
                        WINDOW w as (
                                PARTITION BY partei_id
                                ORDER BY landesliste_platz
                                )
                    )
                SELECT r.vorname, r.nachname, p.kurzbezeichnung
                FROM ranked_kandidaten r join sitzProPartei using (partei_id)
                join partei p on r.partei_id = p.id
                WHERE rank <= sitze
                ORDER BY partei_id, landesliste_platz;
            """, nativeQuery = true)
    List<Object[]> getListenPlatze(int year, long bundesland_id);

    @Query(value = """
                SELECT id, name
                FROM bundesland;
            """, nativeQuery = true)
    List<Object[]> getBundesLander();

    @Query(value = """
            WITH maxVotesProWahlkreis as (
                SELECT wahlkreis_id, jahr, MAX(stimmen) as max_stimmen
                FROM zweitestimme_aggr
                WHERE jahr = :year
                GROUP BY wahlkreis_id, jahr
                        )
                          , winning_parties AS (
                SELECT
                    z.wahlkreis_id,
                    z.jahr,
                    z.partei_id AS winning_partei_id,
                    p.kurzbezeichnung AS winning_partei_name,
                    z.stimmen,
                    'zweitestimme' AS type
                FROM zweitestimme_aggr z
                            JOIN maxVotesProWahlkreis mv ON z.wahlkreis_id = mv.wahlkreis_id
                            JOIN partei p ON z.partei_id = p.id
                WHERE z.stimmen = mv.max_stimmen
            ),
            
                 weighted_data AS (
                     -- Combine socio-cultural info with population and winning party
                     SELECT
                         w.name,
                         ws.year,
                         ws.SVB_insgesamt,
                         ws.SVB_landw_fischerei,
                         ws.SVB_produz_gewerbe,
                         ws.SVB_handel_gast_verkehr,
                         ws.SVB_dienstleister,
                         ws.Alter_unter_18,
                         ws.Alter_18_24,
                         ws.Alter_25_34,
                         ws.Alter_35_59,
                         ws.Alter_60_74,
                         ws.Alter_75_plus,
                         ws.ALQ_frauen,
                         ws.ALQ_15_24,
                         ws.ALQ_55_64,
                         ws.ALQ_insgesamt,
                         ws.ALQ_maenner,
                         pw.population,
                         wp.winning_partei_id,
                         wp.winning_partei_name,
                         wp.type
                     FROM wahlkreis_soziokulturell_info ws
                              JOIN population_wahlkreis pw
                                   ON ws.wahlkreis_id = pw.wahlkreis_id AND ws.year = pw.year
                              JOIN winning_parties wp
                                   ON ws.wahlkreis_id = wp.wahlkreis_id AND ws.year = wp.jahr
                                 JOIN wahlkreis w on ws.wahlkreis_id = w.id
                    where ws.year = :year
                 ),
            
                 averages AS (
                     -- Calculate population-weighted averages for each winning party and type (erst/zweit)
                     SELECT
                         wd.winning_partei_name,
                         wd.name,
                         wd.type,
                         AVG(wd.SVB_insgesamt / 10) AS avg_SVB_insgesamt,
                         AVG(wd.SVB_landw_fischerei) AS avg_SVB_landw_fischerei,
                         AVG(wd.SVB_produz_gewerbe) AS avg_SVB_produz_gewerbe,
                         AVG(wd.SVB_handel_gast_verkehr) AS avg_SVB_handel_gast_verkehr,
                         AVG(wd.SVB_dienstleister) AS avg_SVB_dienstleister,
                         AVG(wd.Alter_unter_18) AS avg_Alter_unter_18,
                         AVG(wd.Alter_18_24) AS avg_Alter_18_24,
                         AVG(wd.Alter_25_34) AS avg_Alter_25_34,
                         AVG(wd.Alter_35_59) AS avg_Alter_35_59,
                         AVG(wd.Alter_60_74) AS avg_Alter_60_74,
                         AVG(wd.Alter_75_plus) AS avg_Alter_75_plus,
                         AVG(wd.ALQ_frauen) AS avg_ALQ_frauen,
                         AVG(wd.ALQ_15_24) AS avg_ALQ_15_24,
                         AVG(wd.ALQ_55_64) AS avg_ALQ_55_64,
                         AVG(wd.ALQ_insgesamt) AS avg_ALQ_insgesamt,
                         AVG(wd.ALQ_maenner) AS avg_ALQ_maenner
                     FROM weighted_data wd
                     GROUP BY wd.winning_partei_name, wd.name, wd.year, wd.type
                 )
            
            SELECT * from averages a
                        where a.type = :type;
            """, nativeQuery = true)
    List<Object[]> getSozioKulturellProPartei(String type, int year);

    /**
     * Returns party name, sum of first votes, plus placeholders
     * for secondVotes, seats, percentage.
     */
    @Query(value = """
        SELECT p.kurzbezeichnung                          AS party,
              w.name as wahlkreis,
               COUNT(e.id)                     AS firstVotes,
               0                               AS secondVotes,
               0                               AS seats,
               0.0                             AS percentage
        FROM erststimme e
                    JOIN wahlkreis w on w.id = e.wahlkreis_id
                    JOIN elections el on el.status = 'ACTIVE' and el.year = e.jahr
        JOIN partei p ON p.id = e.partei_id
        GROUP BY p.kurzbezeichnung, w.name
        """,
            nativeQuery = true)
    List<Object[]> findFirstVotesNative();

    /**
     * Returns party name, sum of second votes, plus placeholders
     * for firstVotes, seats, percentage.
     */
    @Query(value = """
        SELECT p.kurzbezeichnung                          AS party,
               w.name as wahlkreis,
               0                               AS firstVotes,
               COUNT(z.id)                     AS secondVotes,
               0                               AS seats,
               0.0                             AS percentage
        FROM zweitestimme z
                    JOIN wahlkreis w on w.id = z.wahlkreis_id
                    JOIN elections el on el.status = 'ACTIVE' and el.year = z.jahr
        JOIN partei p ON p.id = z.partei_id
        GROUP BY p.kurzbezeichnung, w.name
        """,
            nativeQuery = true)
    List<Object[]> findSecondVotesNative();


}
