DELETE FROM erststimme_aggr
WHERE jahr = 2025;

DELETE FROM zweitestimme_aggr
WHERE jahr = 2025;

INSERT INTO erststimme_aggr(id, partei_id, wahlkreis_id, jahr, stimmen)
SELECT nextval('erststimme_aggr_seq'), partei_id, wahlkreis_id, 2025, stimmen
FROM erststimme_aggr
WHERE jahr = 2021;

INSERT INTO zweitestimme_aggr(id, partei_id, wahlkreis_id, jahr, stimmen)
SELECT nextval('zweitestimme_aggr_seq'), partei_id, wahlkreis_id, 2025, stimmen
FROM zweitestimme_aggr
WHERE jahr = 2021;