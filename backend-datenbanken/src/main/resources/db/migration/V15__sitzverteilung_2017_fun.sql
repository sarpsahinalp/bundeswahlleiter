WITH RECURSIVE
---------------------------------------------------------
-- A. Calculation for Erste Oberverteilung (first upper distribution)
---------------------------------------------------------
pop_total AS (SELECT SUM(b.bevoelkerung) AS total_pop
              FROM bevoelkerung b
              WHERE b.jahr = 2017),
-- Calculate initial divisor for first oberverteilung using the provided target seat number (e.g. 598)
init_divisor_ober AS (SELECT (total_pop / 598.0)::float AS divisor
                      FROM pop_total),
-- Recursive CTE to adjust divisor based on total seats from population
rec_ober AS (SELECT d.divisor,
                    (SELECT SUM(ROUND(b.bevoelkerung / d.divisor))
                     FROM bevoelkerung b
                     WHERE b.jahr = 2017) AS sitze_verteilt,
                    0                     AS iteration
             FROM init_divisor_ober d
             UNION ALL
             SELECT CASE
                        WHEN (598 - r.sitze_verteilt) > 0 THEN r.divisor - 10
                        ELSE r.divisor + 10
                        END               AS divisor,
                    (SELECT SUM(ROUND(b.bevoelkerung /
                                      (CASE
                                           WHEN (598 - r.sitze_verteilt) > 0 THEN r.divisor - 10
                                           ELSE r.divisor + 10
                                          END)))
                     FROM bevoelkerung b
                     WHERE b.jahr = 2017) AS sitze_verteilt,
                    r.iteration + 1       AS iteration
             FROM rec_ober r
             WHERE r.sitze_verteilt <> 598
    -- Optionally add "AND r.iteration < 1000" as a safeguard
),
final_ober AS (SELECT divisor
               FROM rec_ober
               ORDER BY iteration DESC
               LIMIT 1),
-- Here, instead of inserting the calculated first oberverteilung into a table,
-- we simply compute the result per bundesland for later use.
calc_erste_ober AS (SELECT b.bundesland_id,
                           ROUND(b.bevoelkerung / f.divisor)::int AS sitze,
                           2017                                   AS jahr
                    FROM bevoelkerung b
                             CROSS JOIN final_ober f
                    WHERE b.jahr = 2017),

---------------------------------------------------------
-- B. Calculation for Erste Unterverteilung (first lower distribution)
---------------------------------------------------------
-- For each bundesland, use its number of seats from calc_erste_ober as the target.
rec_unter AS (SELECT sz.bundesland                 AS bundesland_id,
                     sz.partei_id,
                     sz.jahr,
                     (SELECT SUM(gesamtStimmen)
                      FROM sumZweiteStimmeProParteiInBundesland
                      WHERE jahr = sz.jahr
                        AND bundesland = sz.bundesland)
                         /
                     (SELECT sitze
                      FROM calc_erste_ober
                      WHERE bundesland_id = sz.bundesland
                        AND jahr = sz.jahr)::float AS divisor,
                     (SELECT sitze
                      FROM calc_erste_ober
                      WHERE bundesland_id = sz.bundesland
                        AND jahr = sz.jahr)        AS zielWert,
                     SUM(CASE
                             WHEN ROUND(sz.gesamtStimmen /
                                        (
                                            (SELECT SUM(gesamtStimmen)
                                             FROM sumZweiteStimmeProParteiInBundesland
                                             WHERE jahr = sz.jahr
                                               AND bundesland = sz.bundesland)
                                                /
                                            ((SELECT sitze
                                              FROM calc_erste_ober
                                              WHERE bundesland_id = sz.bundesland
                                                AND jahr = sz.jahr)::float)
                                            )
                                  ) < m.mindesSitzAnspruch
                                 THEN m.mindesSitzAnspruch
                             ELSE ROUND(sz.gesamtStimmen /
                                        (
                                            (SELECT SUM(gesamtStimmen)
                                             FROM sumZweiteStimmeProParteiInBundesland
                                             WHERE jahr = sz.jahr
                                               AND bundesland = sz.bundesland)
                                                /
                                            ((SELECT sitze
                                              FROM calc_erste_ober
                                              WHERE bundesland_id = sz.bundesland
                                                AND jahr = sz.jahr)::float)
                                            )
                                  )
                         END)                      AS verteilteSitze,
                     0                             AS iteration
              FROM sumZweiteStimmeProParteiInBundesland sz
                       JOIN uberhangAndMindestsiztanzahl2017 m
                            ON m.partei_id = sz.partei_id
                                AND m.jahr = sz.jahr
                                AND sz.bundesland = m.bundesland_id
              WHERE sz.jahr = 2017
              GROUP BY sz.bundesland, sz.partei_id, sz.jahr),
rec_unter_iter AS (SELECT *
                   FROM rec_unter
                   UNION ALL
                   SELECT r.bundesland_id,
                          r.partei_id,
                          r.jahr,
                          CASE
                              WHEN (r.zielWert - r.verteilteSitze) > 0 THEN r.divisor - 10
                              ELSE r.divisor + 10
                              END                  AS divisor,
                          r.zielWert,
                          (SELECT SUM(
                                          CASE
                                              WHEN ROUND(sz.gesamtStimmen /
                                                         (CASE
                                                              WHEN (r.zielWert - r.verteilteSitze) > 0
                                                                  THEN r.divisor - 10
                                                              ELSE r.divisor + 10
                                                             END)
                                                   ) < m.mindesSitzAnspruch
                                                  THEN m.mindesSitzAnspruch
                                              ELSE ROUND(sz.gesamtStimmen /
                                                         (CASE
                                                              WHEN (r.zielWert - r.verteilteSitze) > 0
                                                                  THEN r.divisor - 10
                                                              ELSE r.divisor + 10
                                                             END)
                                                   )
                                              END)
                           FROM sumZweiteStimmeProParteiInBundesland sz
                                    JOIN uberhangAndMindestsiztanzahl2017 m
                                         ON m.partei_id = sz.partei_id
                                             AND m.jahr = sz.jahr
                                             AND sz.bundesland = m.bundesland_id
                           WHERE sz.partei_id = r.partei_id
                             AND sz.jahr = r.jahr) AS verteilteSitze,
                          r.iteration + 1          AS iteration
                   FROM rec_unter r
                   WHERE r.verteilteSitze <> r.zielWert
    -- Optionally: AND r.iteration < 1000
),
final_unter AS (SELECT DISTINCT ON (partei_id, jahr) partei_id,
                                                     bundesland_id,
                                                     divisor,
                                                     jahr,
                                                     iteration
                FROM rec_unter_iter
                ORDER BY partei_id, jahr, iteration DESC),
-- Instead of inserting the first unterverteilung results into a table, we simply compute them:
calc_erste_unter AS (SELECT sz.bundesland                             AS bundesland_id,
                            sz.partei_id,
                            ROUND(sz.gesamtStimmen / fu.divisor)::int AS sitze,
                            sz.jahr
                     FROM sumZweiteStimmeProParteiInBundesland sz
                              JOIN final_unter fu
                                   ON fu.partei_id = sz.partei_id
                                       AND fu.jahr = sz.jahr
                     WHERE sz.jahr = 2017),

---------------------------------------------------------
-- C. Calculation for Zweiter Oberverteilung & Zweiter Unterverteilung
---------------------------------------------------------
-- Second ober distribution:
rec_ober_zweit AS (SELECT sz.partei_id,
                          sz.jahr,
                          SUM(sz.gesamtStimmen) /
                          (SELECT sitze
                           FROM zweiter_oberverteilung zo
                           WHERE zo.partei_id = sz.partei_id
                             AND zo.jahr = sz.jahr)::float AS dummy_divisor
                   FROM sumZweiteStimmeProParteiInBundesland sz
                   WHERE sz.jahr = 2017
                   GROUP BY sz.partei_id, sz.jahr),
-- For simplicity, we inline the recursive calculation used for the second unterverteilung.
init_divisor_zweit AS (SELECT sz.partei_id,
                              sz.jahr,
                              SUM(sz.gesamtStimmen) /
                              (SELECT sitze
                               FROM zweiter_oberverteilung zo
                               WHERE zo.partei_id = sz.partei_id
                                 AND zo.jahr = sz.jahr)::float AS divisor
                       FROM sumZweiteStimmeProParteiInBundesland sz
                       WHERE sz.jahr = 2017
                       GROUP BY sz.partei_id, sz.jahr),
init_iter_zweit AS (SELECT sz.partei_id,
                           sz.jahr,
                           idiv.divisor,
                           zo.sitze AS zielWert,
                           SUM(CASE
                                   WHEN ROUND(sz.gesamtStimmen / idiv.divisor) < m.mindesSitzAnspruch
                                       THEN m.mindesSitzAnspruch
                                   ELSE ROUND(sz.gesamtStimmen / idiv.divisor)
                               END) AS verteilteSitze,
                           0        AS iteration
                    FROM sumZweiteStimmeProParteiInBundesland sz
                             JOIN uberhangAndMindestsiztanzahl2017 m
                                  ON m.partei_id = sz.partei_id
                                      AND m.jahr = sz.jahr
                                      AND sz.bundesland = m.bundesland_id
                             JOIN init_divisor_zweit idiv
                                  ON idiv.partei_id = sz.partei_id
                                      AND idiv.jahr = sz.jahr
                             JOIN zweiter_oberverteilung zo
                                  ON zo.partei_id = sz.partei_id
                                      AND zo.jahr = sz.jahr
                    WHERE sz.jahr = 2017
                    GROUP BY sz.partei_id, sz.jahr, idiv.divisor, zo.sitze),
rec_iter_zweit AS (SELECT *
                   FROM init_iter_zweit
                   UNION ALL
                   SELECT r.partei_id,
                          r.jahr,
                          CASE
                              WHEN (r.zielWert - r.verteilteSitze) > 0 THEN r.divisor - 10
                              ELSE r.divisor + 10
                              END                  AS divisor,
                          r.zielWert,
                          (SELECT SUM(
                                          CASE
                                              WHEN ROUND(sz.gesamtStimmen /
                                                         (CASE
                                                              WHEN (r.zielWert - r.verteilteSitze) > 0
                                                                  THEN r.divisor - 10
                                                              ELSE r.divisor + 10
                                                             END)
                                                   ) < m.mindesSitzAnspruch
                                                  THEN m.mindesSitzAnspruch
                                              ELSE ROUND(sz.gesamtStimmen /
                                                         (CASE
                                                              WHEN (r.zielWert - r.verteilteSitze) > 0
                                                                  THEN r.divisor - 10
                                                              ELSE r.divisor + 10
                                                             END)
                                                   )
                                              END)
                           FROM sumZweiteStimmeProParteiInBundesland sz
                                    JOIN uberhangAndMindestsiztanzahl2017 m
                                         ON m.partei_id = sz.partei_id
                                             AND m.jahr = sz.jahr
                                             AND sz.bundesland = m.bundesland_id
                           WHERE sz.partei_id = r.partei_id
                             AND sz.jahr = r.jahr) AS verteilteSitze,
                          r.iteration + 1          AS iteration
                   FROM rec_iter_zweit r
                   WHERE r.verteilteSitze <> r.zielWert),
final_zweit AS (SELECT DISTINCT ON (partei_id, jahr) partei_id,
                                                     jahr,
                                                     divisor
                FROM rec_iter_zweit
                ORDER BY partei_id, jahr, iteration DESC),
ins_zweite_unter AS (
    INSERT INTO zweite_unterverteilung (partei_id, divisor, jahr)
        SELECT f.partei_id,
               f.divisor,
               f.jahr
        FROM final_zweit f
        ON CONFLICT (partei_id, jahr)
            DO UPDATE SET divisor = EXCLUDED.divisor
        RETURNING *)

SELECT 'Final Zweite Unterverteilung' AS step, *
FROM ins_zweite_unter;