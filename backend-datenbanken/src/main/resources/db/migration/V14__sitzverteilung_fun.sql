create table if not exists erste_oberverteilung
(
    bundesland_id INT references bundesland (id),
    sitze         INT,
    jahr          INT,
    primary key (bundesland_id, jahr)
);

create table if not exists erste_unterverteilung
(
    bundesland_id INT references bundesland (id),
    partei_id     INT references partei (id),
    sitze         INT,
    jahr          INT,
    primary key (bundesland_id, partei_id, jahr)
);

create table if not exists mindestSitzanspruch
(
    bundesland_id      INT references bundesland (id),
    partei_id          INT references partei (id),
    sitze              INT,
    jahr               INT,
    drohendeUberhang   INT,
    mindesSitzAnspruch INT,
    primary key (bundesland_id, partei_id, jahr)
);

create table if not exists zweiter_oberverteilung
(
    partei_id INT,
    sitze     INT,
    jahr      INT,
    primary key (partei_id, jahr)
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
        sumZweiteStimmeImJahrUndBundesland AS (
            SELECT *
            FROM sumZweiteStimmeProParteiInBundesland
            WHERE jahr = :paramJahr
              AND bundesland = :bundeslandId
        ),
        total_votes AS (
            SELECT SUM(gesamtStimmen)::FLOAT AS votes_sum
            FROM sumZweiteStimmeImJahrUndBundesland
        ),
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
                                       FROM total_votes tv)      AS seats_for_mid
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
    WITH
        base_overhang AS (
            SELECT
                u.partei_id,
                SUM(u.drohendeUberhang)   AS drohenderUberhang,
                SUM(u.mindesSitzAnspruch) AS mindesSitzAnspruch
            FROM uberhangAndMindestsiztanzahl2021 u
            GROUP BY u.partei_id
        ),
        mindestSitzMaximum AS (
            SELECT
                partei_id,
                SUM(sitze) AS mindestSitzAnspruch
            FROM erste_unterverteilung
            WHERE jahr = 2021
            GROUP BY partei_id
        ),
        maximumSitzAnspruch AS (
            SELECT
                bo.partei_id,
                GREATEST(bo.mindesSitzAnspruch, ms.mindestSitzAnspruch) AS mindesSitzAnspruch
            FROM base_overhang bo
                     JOIN mindestSitzMaximum ms
                          ON bo.partei_id = ms.partei_id
        ),
        gesamtStimmenProPartei AS (
            SELECT
                za.partei_id,
                SUM(za.gesamtStimmen) AS gesamt
            FROM sumzweitestimmeproparteiinbundesland za
            WHERE za.jahr = 2021
            GROUP BY za.partei_id
        ),
        obergrenze_ohne_uberhang AS (
            SELECT
                ms.partei_id,
                (gs.gesamt / (ms.mindestSitzAnspruch - 0.5)) AS divisor
            FROM mindestSitzMaximum ms
                     JOIN gesamtStimmenProPartei gs
                          ON ms.partei_id = gs.partei_id
                     JOIN base_overhang bo
                          ON ms.partei_id = bo.partei_id
            WHERE bo.drohenderUberhang > 0
        ),
        obergrenze_mit_uberhang AS (
            WITH param AS (
                SELECT
                    ms.partei_id,
                    gs.gesamt,
                    ms.mindesSitzAnspruch AS anspruch
                FROM maximumSitzAnspruch ms
                         JOIN gesamtStimmenProPartei gs
                              ON ms.partei_id = gs.partei_id
                         JOIN base_overhang bo
                              ON ms.partei_id = bo.partei_id
                WHERE bo.drohenderUberhang > 0
            )
            SELECT
                p.partei_id,
                p.gesamt,
                p.anspruch,
                (p.gesamt / (p.anspruch - (0.5 + g.step))) AS divisor
            FROM param p
                     CROSS JOIN generate_series(0, 3, 1) AS g(step)  -- steps: 0,1,2,3
            WHERE (p.anspruch - (0.5 + g.step)) <> 0
        ),
        all_obergrenzen AS (
            SELECT divisor
            FROM obergrenze_mit_uberhang
            UNION ALL
            SELECT divisor
            FROM obergrenze_ohne_uberhang
        ),
        minObergrenze AS (
            SELECT
                FLOOR(divisor) AS divisor
            FROM (
                     SELECT divisor
                     FROM obergrenze_mit_uberhang
                     ORDER BY divisor
                     OFFSET 3 LIMIT 1
                 ) sub
            UNION
            SELECT MIN(divisor)
            FROM obergrenze_ohne_uberhang
        ),
        final_divisor AS (
            SELECT MIN(divisor) AS divisor
            FROM minObergrenze
        ),

        berechnung_neu_sitze_pro_partei AS (
            SELECT
                ms.partei_id,
                ms.mindesSitzAnspruch,
                gs.gesamt,
                fd.divisor,
                ROUND(gs.gesamt / fd.divisor) +
                CASE WHEN ms.mindesSitzAnspruch - ROUND(gs.gesamt / fd.divisor) > 0
                         THEN (ms.mindesSitzAnspruch - ROUND(gs.gesamt / fd.divisor))
                     ELSE 0
                    END AS sitzeNachErhohung
            FROM maximumSitzAnspruch ms
                     JOIN gesamtStimmenProPartei gs
                          ON ms.partei_id = gs.partei_id
                     CROSS JOIN final_divisor fd
        )

    INSERT INTO zweiter_oberverteilung (partei_id, sitze, jahr)
    SELECT
        b.partei_id,
        b.sitzeNachErhohung,
        2021
    FROM berechnung_neu_sitze_pro_partei b
    ON CONFLICT (partei_id, jahr)
        DO UPDATE SET sitze = EXCLUDED.sitze;

END;
$$ LANGUAGE plpgsql;

select calculate_divisor_min_seat_claims();


