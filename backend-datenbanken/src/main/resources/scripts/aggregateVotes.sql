DELETE FROM erststimme_aggr
WHERE jahr = :year;

DELETE FROM zweitestimme_aggr
WHERE jahr = :year;

INSERT INTO erststimme_aggr(id, partei_id, wahlkreis_id, jahr, stimmen)
SELECT nextval('erststimme_aggr_seq'), partei_id, wahlkreis_id, jahr, count(*)
FROM erststimme
WHERE jahr = :year
GROUP BY partei_id, wahlkreis_id, jahr;

INSERT INTO zweitestimme_aggr(id, partei_id, wahlkreis_id, jahr, stimmen)
SELECT nextval('zweitestimme_aggr_seq'), partei_id, wahlkreis_id, jahr, count(*)
FROM zweitestimme
WHERE jahr = :year
GROUP BY partei_id, wahlkreis_id, jahr;