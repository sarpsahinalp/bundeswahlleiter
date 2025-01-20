package db.in.tum.de.datenbanken.logic;

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
    List<Object[]> getWahlbeteiligung(int year, long wahlkreis_id,  boolean useAggregation);

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
        -- Rank the votes in each Wahlkreis to determine the winner and other parties
        SELECT
            e.Wahlkreis_ID,
            e.Partei_ID,
            p.kurzbezeichnung,
            e.Stimmen,
            RANK() OVER (PARTITION BY e.Wahlkreis_ID ORDER BY e.Stimmen DESC) AS Stimmen_Rang
        FROM
            erststimme_aggr e
                JOIN
            Partei p ON e.Partei_ID = p.id
        where e.jahr = :year
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
             -- Get all victories, calculating the difference between the winner and second place
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
             -- Get all losses, calculating the difference to the winner for each party
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
                 ROW_NUMBER() OVER (PARTITION BY Partei_Name ORDER BY Typ, Differenz ASC) AS Rang
             FROM
                 CombinedResults
         )
    SELECT
        r.Partei_Name,
        w.name,
        r.Typ,
        r.Stimmen,
        r.Differenz
    FROM
        RankedResults r, wahlkreis w
    WHERE
        r.wahlkreis_id = w.id
        and
        Rang <= 10
    ORDER BY
        Partei_Name, Rang;
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
    """ , nativeQuery = true)
    List<Object[]> getNonVotersProStimmen(int year, String erststimme);

    @Query(value = """
        with sitzProPartei AS(
            SELECT
                zu.partei_id,
                s.bundesland as bundesland_id,
                GREATEST(round(gesamtstimmen / divisor),
                         (SELECT u.mindessitzanspruch FROM uberhangandmindestsiztanzahl2021 u WHERE u.partei_id = s.partei_id and u.jahr = s.jahr and u.bundesland_id = s.bundesland),
                         (SELECT u.mindessitzanspruch FROM uberhangandmindestsiztanzahl2017 u WHERE u.partei_id = s.partei_id and u.jahr = s.jahr and u.bundesland_id = s.bundesland)
                ) as sitze
            FROM zweite_unterverteilung zu
                     join sumzweitestimmeproparteiinbundesland s using (partei_id, jahr)
            WHERE jahr = :year and s.bundesland = :bundesland_id
        ),
         erststimme_max AS (
             SELECT MAX(stimmen) as anz, wahlkreis_id
             FROM erststimme_aggr ea join wahlkreis w on ea.wahlkreis_id = w.id
             WHERE jahr = :year and w.bundesland_id = :bundesland_id
             GROUP BY wahlkreis_id
         ),
         direktmandate(partei_id, wahlkreis_id) AS (
             SELECT partei_id, wahlkreis_id
             FROM erststimme_aggr ea join wahlkreis w on ea.wahlkreis_id = w.id
             WHERE stimmen = (SELECT anz FROM erststimme_max em WHERE em.wahlkreis_id = ea.wahlkreis_id)
               and jahr = :year and w.bundesland_id = :bundesland_id
         ),
         wahlkreis_mandate AS (
             SELECT k.id as kandidatur_id, vorname, nachname, partei_id, wahlkreis_id, landesliste_platz
             FROM direktmandate join kandidatur k using (partei_id, wahlkreis_id)
             WHERE jahr = :year
         ),
        landesliste_mandate AS (
            SELECT k.id as kandidatur_id, vorname, nachname, partei_id, wahlkreis_id,
                   (landesliste_platz -
                    (SELECT count(*) FROM wahlkreis_mandate wm WHERE wm.partei_id = k.partei_id and wm.landesliste_platz < k.landesliste_platz)
                    ) as listenplatz,
                    ((SELECT s.sitze FROM sitzProPartei s WHERE s.partei_id = k.partei_id) -
                     (SELECT count(*) from direktmandate d where d.partei_id = k.partei_id)) as sitze
            FROM kandidatur k join wahlkreis w on k.wahlkreis_id = w.id
            WHERE jahr = :year and w.bundesland_id = :bundesland_id
              and not exists(SELECT * FROM wahlkreis_mandate wm WHERE wm.kandidatur_id = k.id)
        )
        SELECT vorname, nachname, p.kurzbezeichnung, lm.wahlkreis_id, listenplatz, sitze
        FROM landesliste_mandate lm join partei p on lm.partei_id = p.id
        WHERE listenplatz is not null;
    """, nativeQuery = true)
    List<Object[]> getListenPlatze(int year, long bundesland_id);

    @Query(value = """
        with erststimme_max AS (
                 SELECT MAX(stimmen) as anz, wahlkreis_id
                 FROM erststimme_aggr ea join wahlkreis w on ea.wahlkreis_id = w.id
                 WHERE jahr = :year and w.bundesland_id = :bundesland_id
                 GROUP BY wahlkreis_id
             ),
             direktmandate(partei_id, wahlkreis_id) AS (
                 SELECT partei_id, wahlkreis_id
                 FROM erststimme_aggr ea join wahlkreis w on ea.wahlkreis_id = w.id
                 WHERE stimmen = (SELECT anz FROM erststimme_max em WHERE em.wahlkreis_id = ea.wahlkreis_id)
                   and jahr = :year and w.bundesland_id = :bundesland_id
             ),
             wahlkreis_mandate AS (
                 SELECT k.id as kandidatur_id, vorname, nachname, partei_id, wahlkreis_id, landesliste_platz
                 FROM direktmandate join kandidatur k using (partei_id, wahlkreis_id)
                 WHERE jahr = :year
             )
        SELECT vorname, nachname, p.kurzbezeichnung, wm.wahlkreis_id
        FROM wahlkreis_mandate wm join partei p on partei_id = p.id;
    """, nativeQuery = true)
    List<Object[]> getWahlkreisPlatze(int year, long bundesland_id);

    @Query(value = """
        SELECT id, name
        FROM bundesland;
    """, nativeQuery = true)
    List<Object[]> getBundesLander();

    @Query(value = """

            WITH winning_parties AS (
                -- Determine the winning party for each wahlkreis and year in erststimme and zweitestimme
                SELECT
                    w.wahlkreis_id,
                    w.jahr,
                    w.partei_id AS winning_partei_id,
                    w.stimmen,
                    'erststimme' AS type
                FROM erststimme_aggr w
                WHERE w.stimmen = (SELECT MAX(ea.stimmen)
                                   FROM erststimme_aggr ea
                                   WHERE ea.wahlkreis_id = w.wahlkreis_id AND ea.jahr = w.jahr)
                
                UNION ALL
                
                SELECT
                    z.wahlkreis_id,
                    z.jahr,
                    z.partei_id AS winning_partei_id,
                    z.stimmen,
                    'zweitestimme' AS type
                FROM zweitestimme_aggr z
                WHERE z.stimmen = (SELECT MAX(za.stimmen)
                                   FROM zweitestimme_aggr za
                                   WHERE za.wahlkreis_id = z.wahlkreis_id AND za.jahr = z.jahr)
            ),
                
                 weighted_data AS (
                     -- Combine socio-cultural info with population and winning party
                     SELECT
                         ws.wahlkreis_id,
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
                         wp.type
                     FROM wahlkreis_soziokulturell_info ws
                              JOIN population_wahlkreis pw
                                   ON ws.wahlkreis_id = pw.wahlkreis_id AND ws.year = pw.year
                              JOIN winning_parties wp
                                   ON ws.wahlkreis_id = wp.wahlkreis_id AND ws.year = wp.jahr
                    where ws.year = :year
                 ),
                
                 averages AS (
                     -- Calculate population-weighted averages for each winning party and type (erst/zweit)
                     SELECT
                         wd.winning_partei_id,
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
                     GROUP BY wd.winning_partei_id, wd.type
                 )
                
            SELECT * from averages a;
            """, nativeQuery = true)
    List<Object[]> getSozioKulturellProPartei(int year);


}
