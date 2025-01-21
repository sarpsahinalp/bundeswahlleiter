---------------------------------------------------------
-- 1. Create Tables
---------------------------------------------------------

CREATE TABLE verteilungskriterium
(
    id      SERIAL PRIMARY KEY,
    name    VARCHAR(255) NOT NULL,
    sitze   INT          NOT NULL,
    divisor FLOAT        NOT NULL
);

CREATE TABLE erste_oberverteilung
(
    bundesland_id INT REFERENCES bundesland (id),
    sitze         INT,
    jahr          INT,
    PRIMARY KEY (bundesland_id, jahr)
);

CREATE TABLE erste_unterverteilung
(
    bundesland_id INT REFERENCES bundesland (id),
    partei_id     INT REFERENCES partei (id),
    sitze         INT,
    jahr          INT,
    PRIMARY KEY (bundesland_id, partei_id, jahr)
);

CREATE TABLE mindestSitzanspruch
(
    bundesland_id      INT REFERENCES bundesland (id),
    partei_id          INT REFERENCES partei (id),
    sitze              INT,
    jahr               INT,
    drohendeUberhang   INT,
    mindesSitzAnspruch INT,
    PRIMARY KEY (bundesland_id, partei_id, jahr)
);

CREATE TABLE zweiter_oberverteilung
(
    partei_id INT,
    sitze     INT,
    jahr      INT,
    PRIMARY KEY (partei_id, jahr)
);

CREATE TABLE zweite_unterverteilung
(
    partei_id INT REFERENCES partei (id),
    divisor   FLOAT,
    jahr      INT,
    PRIMARY KEY (partei_id, jahr)
);

CREATE OR REPLACE function ersteOberverteilungFun(paramJahr INT, zielWert INT)
    RETURNS void
    LANGUAGE plpgsql
AS
$$
BEGIN
    WITH RECURSIVE
        pop_sum AS (SELECT SUM(b.bevoelkerung)::FLOAT AS total_pop
                    FROM bevoelkerung b
                    WHERE b.jahr = :paramJahr),
        seat_divisor AS (SELECT 0::INT                                    AS iteration,
                                (ps.total_pop / (:zielwert * 2.0))::FLOAT AS low_div,
                                (ps.total_pop / (:zielwert * 0.1))::FLOAT AS high_div,
                                0::FLOAT                                  AS mid_div,
                                0::INT                                    AS seat_sum
                         FROM pop_sum ps

                         UNION ALL

                         SELECT x.iteration + 1,
                                CASE
                                    WHEN seats_for_mid > :zielwert
                                        THEN mid_val
                                    ELSE
                                        x.low_div
                                    END            AS low_div,

                                CASE
                                    WHEN seats_for_mid < :zielwert
                                        THEN mid_val
                                    ELSE
                                        x.high_div
                                    END            AS high_div,

                                mid_val,
                                seats_for_mid::INT AS seat_sum
                         FROM (SELECT sd.iteration,
                                      sd.low_div,
                                      sd.high_div,
                                      (sd.low_div + sd.high_div) / 2.0 AS mid_val,
                                      (SELECT SUM(ROUND(b.bevoelkerung / ((sd.low_div + sd.high_div) / 2.0)))
                                       FROM bevoelkerung b
                                       WHERE b.jahr = :paramJahr)      AS seats_for_mid
                               FROM seat_divisor sd
                               WHERE sd.iteration < 50
                                 AND sd.seat_sum != :zielwert) AS x),
        final_row AS (SELECT sd.*
                      FROM seat_divisor sd
                      ORDER BY sd.iteration DESC
                      LIMIT 1)

    INSERT
    INTO erste_oberverteilung (bundesland_id, sitze, jahr)
    SELECT b.bundesland_id,
           ROUND(b.bevoelkerung / fr.mid_div) AS sitze,
           :paramJahr
    FROM bevoelkerung b,
         final_row fr
    WHERE b.jahr = :paramJahr
    ON CONFLICT (bundesland_id, jahr)
        DO UPDATE SET sitze = EXCLUDED.sitze;
end;
$$;

-- select ersteOberverteilungFun(2021, 598);
--
-- select *
--     from bundesland b join erste_oberverteilung e on b.id = e.bundesland_id;


CREATE OR REPLACE FUNCTION ersteUnterverteilungFun(
    bundeslandId INT,
    zielWert INT,
    paramJahr INT
)
    RETURNS VOID AS
$$
BEGIN
    WITH RECURSIVE
        sumZweiteStimmeImJahrUndBundesland AS (SELECT *
                                               FROM sumZweiteStimmeProParteiInBundesland
                                               WHERE jahr = :paramJahr
                                                 AND bundesland = :bundeslandId),
        total_votes AS (SELECT SUM(gesamtStimmen)::FLOAT AS votes_sum
                        FROM sumZweiteStimmeImJahrUndBundesland),
        seat_divisor AS (SELECT 0::INT                                    AS iteration,
                                (ps.votes_sum / (:zielwert * 2.0))::FLOAT AS low_div,
                                (ps.votes_sum / (:zielwert * 0.1))::FLOAT AS high_div,
                                0::FLOAT                                  AS mid_div,
                                0::INT                                    AS seat_sum
                         FROM total_votes ps

                         UNION ALL

                         SELECT x.iteration + 1,
                                CASE
                                    WHEN seats_for_mid > :zielwert
                                        THEN mid_val
                                    ELSE
                                        x.low_div
                                    END            AS low_div,

                                CASE
                                    WHEN seats_for_mid < :zielwert
                                        THEN mid_val
                                    ELSE
                                        x.high_div
                                    END            AS high_div,

                                mid_val,
                                seats_for_mid::INT AS seat_sum
                         FROM (SELECT sd.iteration,
                                      sd.low_div,
                                      sd.high_div,
                                      (sd.low_div + sd.high_div) / 2.0 AS mid_val,
                                      (SELECT SUM(ROUND(tv.votes_sum / ((sd.low_div + sd.high_div) / 2.0)))
                                       FROM total_votes tv)            AS seats_for_mid
                               FROM seat_divisor sd
                               WHERE sd.iteration < 50
                                 AND sd.seat_sum != :zielwert) AS x),
        final_row AS (SELECT sd.*
                      FROM seat_divisor sd
                      ORDER BY sd.iteration DESC
                      LIMIT 1)
    INSERT
    INTO erste_unterverteilung (bundesland_id, partei_id, sitze, jahr)
    SELECT za.bundesland, za.partei_id, round(za.gesamtStimmen / f.mid_div) as sitze, za.jahr
    FROM sumZweiteStimmeImJahrUndBundesland za,
         final_row f
    where za.jahr = :paramJahr
      and za.bundesland = :bundeslandId
    ON CONFLICT (bundesland_id, partei_id, jahr)
        DO UPDATE SET sitze = EXCLUDED.sitze;

END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_divisor_min_seat_claims()
    RETURNS VOID AS
$$
BEGIN
    WITH base_overhang AS (SELECT u.partei_id,
                                  SUM(u.drohendeUberhang)   AS drohenderUberhang,
                                  SUM(u.mindesSitzAnspruch) AS mindesSitzAnspruch
                           FROM uberhangAndMindestsiztanzahl2021 u
                           GROUP BY u.partei_id),
         mindestSitzMaximum AS (SELECT partei_id,
                                       SUM(sitze) AS mindestSitzAnspruch
                                FROM erste_unterverteilung
                                WHERE jahr = 2021
                                GROUP BY partei_id),
         maximumSitzAnspruch AS (SELECT bo.partei_id,
                                        GREATEST(bo.mindesSitzAnspruch, ms.mindestSitzAnspruch) AS mindesSitzAnspruch
                                 FROM base_overhang bo
                                          JOIN mindestSitzMaximum ms
                                               ON bo.partei_id = ms.partei_id),
         gesamtStimmenProPartei AS (SELECT za.partei_id,
                                           SUM(za.gesamtStimmen) AS gesamt
                                    FROM sumzweitestimmeproparteiinbundesland za
                                    WHERE za.jahr = 2021
                                    GROUP BY za.partei_id),
         obergrenze_ohne_uberhang AS (SELECT ms.partei_id,
                                             (gs.gesamt / (ms.mindestSitzAnspruch - 0.5)) AS divisor
                                      FROM mindestSitzMaximum ms
                                               JOIN gesamtStimmenProPartei gs
                                                    ON ms.partei_id = gs.partei_id
                                               JOIN base_overhang bo
                                                    ON ms.partei_id = bo.partei_id
                                      WHERE bo.drohenderUberhang > 0),
         obergrenze_mit_uberhang AS (WITH param AS (SELECT ms.partei_id,
                                                           gs.gesamt,
                                                           ms.mindesSitzAnspruch AS anspruch
                                                    FROM maximumSitzAnspruch ms
                                                             JOIN gesamtStimmenProPartei gs
                                                                  ON ms.partei_id = gs.partei_id
                                                             JOIN base_overhang bo
                                                                  ON ms.partei_id = bo.partei_id
                                                    WHERE bo.drohenderUberhang > 0)
                                     SELECT p.partei_id,
                                            p.gesamt,
                                            p.anspruch,
                                            (p.gesamt / (p.anspruch - (0.5 + g.step))) AS divisor
                                     FROM param p
                                              CROSS JOIN generate_series(0, 3, 1) AS g(step) -- steps: 0,1,2,3
                                     WHERE (p.anspruch - (0.5 + g.step)) <> 0),
         all_obergrenzen AS (SELECT divisor
                             FROM obergrenze_mit_uberhang
                             UNION ALL
                             SELECT divisor
                             FROM obergrenze_ohne_uberhang),
         minObergrenze AS (SELECT FLOOR(divisor) AS divisor
                           FROM (SELECT divisor
                                 FROM obergrenze_mit_uberhang
                                 ORDER BY divisor
                                 OFFSET 3 LIMIT 1) sub
                           UNION
                           SELECT MIN(divisor)
                           FROM obergrenze_ohne_uberhang),
         final_divisor AS (SELECT MIN(divisor) AS divisor
                           FROM minObergrenze),

         berechnung_neu_sitze_pro_partei AS (SELECT ms.partei_id,
                                                    ms.mindesSitzAnspruch,
                                                    gs.gesamt,
                                                    fd.divisor,
                                                    ROUND(gs.gesamt / fd.divisor) +
                                                    CASE
                                                        WHEN ms.mindesSitzAnspruch - ROUND(gs.gesamt / fd.divisor) > 0
                                                            THEN (ms.mindesSitzAnspruch - ROUND(gs.gesamt / fd.divisor))
                                                        ELSE 0
                                                        END AS sitzeNachErhohung
                                             FROM maximumSitzAnspruch ms
                                                      JOIN gesamtStimmenProPartei gs
                                                           ON ms.partei_id = gs.partei_id
                                                      CROSS JOIN final_divisor fd)

    INSERT
    INTO zweiter_oberverteilung (partei_id, sitze, jahr)
    SELECT b.partei_id,
           b.sitzeNachErhohung,
           2021
    FROM berechnung_neu_sitze_pro_partei b
    ON CONFLICT (partei_id, jahr)
        DO UPDATE SET sitze = EXCLUDED.sitze;

END;
$$ LANGUAGE plpgsql;

-- select calculate_divisor_min_seat_claims();


WITH RECURSIVE
---------------------------------------------------------
-- A. Calculation for Erste Oberverteilung (first upper distribution)
---------------------------------------------------------
pop_total AS (SELECT SUM(b.bevoelkerung) AS total_pop
              FROM bevoelkerung b
              WHERE b.jahr = 2021),
-- Calculate initial divisor for first oberverteilung using the provided target seat number (e.g. 598)
init_divisor_ober AS (SELECT (total_pop / 598.0)::float AS divisor
                      FROM pop_total),
-- Recursive CTE to adjust divisor based on total seats from population
rec_ober AS (SELECT d.divisor,
                    (SELECT SUM(ROUND(b.bevoelkerung / d.divisor))
                     FROM bevoelkerung b
                     WHERE b.jahr = 2021) AS sitze_verteilt,
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
                     WHERE b.jahr = 2021) AS sitze_verteilt,
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
                           2021                                   AS jahr
                    FROM bevoelkerung b
                             CROSS JOIN final_ober f
                    WHERE b.jahr = 2021),

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
                       JOIN uberhangAndMindestsiztanzahl2021 m
                            ON m.partei_id = sz.partei_id
                                AND m.jahr = sz.jahr
                                AND sz.bundesland = m.bundesland_id
              WHERE sz.jahr = 2021
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
                                    JOIN uberhangAndMindestsiztanzahl2021 m
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
                     WHERE sz.jahr = 2021),

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
                   WHERE sz.jahr = 2021
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
                       WHERE sz.jahr = 2021
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
                             JOIN uberhangAndMindestsiztanzahl2021 m
                                  ON m.partei_id = sz.partei_id
                                      AND m.jahr = sz.jahr
                                      AND sz.bundesland = m.bundesland_id
                             JOIN init_divisor_zweit idiv
                                  ON idiv.partei_id = sz.partei_id
                                      AND idiv.jahr = sz.jahr
                             JOIN zweiter_oberverteilung zo
                                  ON zo.partei_id = sz.partei_id
                                      AND zo.jahr = sz.jahr
                    WHERE sz.jahr = 2021
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
                                    JOIN uberhangAndMindestsiztanzahl2021 m
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


