ALTER TABLe zweitestimme DROP CONSTRAINT pk_zweitestimme;
ALTER TABLe zweitestimme DROP CONSTRAINT fk_zweitestimme_on_partei;
ALTER TABLe zweitestimme DROP CONSTRAINT fk_zweitestimme_on_wahlkreis;

ALTER TABLe erststimme DROP CONSTRAINT pk_erststimme;
ALTER TABLe erststimme DROP CONSTRAINT fk_erststimme_on_partei;
ALTER TABLe erststimme DROP CONSTRAINT fk_erststimme_on_wahlkreis;