INSERT INTO bevoelkerung (id, bundesland_id, jahr, bevoelkerung)
SELECT
    nextval('bevoelkerung_seq'),
    bundesland_id,
    2025,
    bevoelkerung
FROM bevoelkerung b
WHERE jahr = 2021;

INSERT INTO kandidatur (id, nachname, vorname, geburtsjahr, partei_id, wahlkreis_id, bundesland_id, landesliste_platz, jahr, titel, namenszusatz, wohnort, beruf)
SELECT nextval('kandidatur_seq'),
       nachname, vorname, geburtsjahr, partei_id, wahlkreis_id, bundesland_id, landesliste_platz,
       2025,
       titel, namenszusatz, wohnort, beruf
FROM kandidatur
WHERE jahr = 2021;

INSERT INTO population_wahlkreis (id, wahlkreis_id, population, year)
SELECT nextval('population_wahlkreis_seq'), wahlkreis_id, population, 2025
FROM population_wahlkreis
WHERE year = 2021;

INSERT INTO wahlberechtigte(id, wahlkreis_id, jahr, wahlberechtigte)
SELECT nextval('wahlberechtigte_seq'), wahlkreis_id, 2025, wahlberechtigte
FROM wahlberechtigte w
WHERE jahr = 2021;
