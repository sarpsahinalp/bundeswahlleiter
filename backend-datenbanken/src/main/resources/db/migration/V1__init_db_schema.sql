CREATE SEQUENCE IF NOT EXISTS bevoelkerung_seq START WITH 1 INCREMENT BY 1;

CREATE SEQUENCE IF NOT EXISTS bundesland_seq START WITH 1 INCREMENT BY 1;

CREATE SEQUENCE IF NOT EXISTS erststimme_aggr_seq START WITH 1 INCREMENT BY 50;

CREATE SEQUENCE IF NOT EXISTS erststimme_seq START WITH 1 INCREMENT BY 1;

CREATE SEQUENCE IF NOT EXISTS kandidatur_seq START WITH 1 INCREMENT BY 1;

CREATE SEQUENCE IF NOT EXISTS minderheitspartei_seq START WITH 1 INCREMENT BY 50;

CREATE SEQUENCE IF NOT EXISTS partei_seq START WITH 1 INCREMENT BY 1;

CREATE SEQUENCE IF NOT EXISTS partei_wahl_teilnahme_seq START WITH 1 INCREMENT BY 1;

CREATE SEQUENCE IF NOT EXISTS wahl_teilnahme_seq START WITH 1 INCREMENT BY 50;

CREATE SEQUENCE IF NOT EXISTS wahlkreis_seq START WITH 1 INCREMENT BY 1;

CREATE SEQUENCE IF NOT EXISTS zweitestimme_aggr_seq START WITH 1 INCREMENT BY 50;

CREATE SEQUENCE IF NOT EXISTS zweitestimme_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE bevoelkerung
(
    id            BIGINT  NOT NULL,
    bundesland_id BIGINT  NOT NULL,
    jahr          INTEGER NOT NULL,
    bevoelkerung  BIGINT  NOT NULL,
    CONSTRAINT pk_bevoelkerung PRIMARY KEY (id)
);

CREATE TABLE bundesland
(
    id   BIGINT       NOT NULL,
    name VARCHAR(255) NOT NULL,
    CONSTRAINT pk_bundesland PRIMARY KEY (id)
);

CREATE TABLE erststimme
(
    id           BIGINT  NOT NULL,
    partei_id    BIGINT  NOT NULL,
    wahlkreis_id BIGINT  NOT NULL,
    jahr         INTEGER NOT NULL,
    CONSTRAINT pk_erststimme PRIMARY KEY (id)
);

CREATE TABLE erststimme_aggr
(
    id           BIGINT  NOT NULL,
    partei_id    BIGINT  NOT NULL,
    wahlkreis_id BIGINT  NOT NULL,
    jahr         INTEGER NOT NULL,
    stimmen      BIGINT  NOT NULL,
    CONSTRAINT pk_erststimme_aggr PRIMARY KEY (id)
);

CREATE TABLE kandidatur
(
    id                BIGINT       NOT NULL,
    nachname          VARCHAR(255) NOT NULL,
    vorname           VARCHAR(255) NOT NULL,
    geburtsjahr       INTEGER      NOT NULL,
    partei_id         BIGINT,
    wahlkreis_id      BIGINT,
    bundesland_id     BIGINT,
    landesliste_platz INTEGER,
    jahr              INTEGER      NOT NULL,
    CONSTRAINT pk_kandidatur PRIMARY KEY (id)
);

CREATE TABLE minderheitspartei
(
    id        BIGINT NOT NULL,
    partei_id BIGINT,
    CONSTRAINT pk_minderheitspartei PRIMARY KEY (id)
);

CREATE TABLE partei
(
    id                BIGINT       NOT NULL,
    name              VARCHAR(255),
    kurzbezeichnung   VARCHAR(255) NOT NULL,
    zusatzbezeichnung VARCHAR(255),
    wahlkreis_id      BIGINT,
    is_einzelbewerber BOOLEAN      NOT NULL,
    CONSTRAINT pk_partei PRIMARY KEY (id)
);

CREATE TABLE partei_wahl_teilnahme
(
    id        BIGINT  NOT NULL,
    partei_id BIGINT  NOT NULL,
    jahr      INTEGER NOT NULL,
    CONSTRAINT pk_partei_wahl_teilnahme PRIMARY KEY (id)
);

CREATE TABLE wahl_teilnahme
(
    id BIGINT NOT NULL,
    CONSTRAINT pk_wahl_teilnahme PRIMARY KEY (id)
);

CREATE TABLE wahlkreis
(
    id            BIGINT       NOT NULL,
    name          VARCHAR(255) NOT NULL,
    bundesland_id BIGINT       NOT NULL,
    CONSTRAINT pk_wahlkreis PRIMARY KEY (id)
);

CREATE TABLE zweitestimme
(
    id           BIGINT  NOT NULL,
    partei_id    BIGINT  NOT NULL,
    wahlkreis_id BIGINT  NOT NULL,
    jahr         INTEGER NOT NULL,
    CONSTRAINT pk_zweitestimme PRIMARY KEY (id)
);

CREATE TABLE zweitestimme_aggr
(
    id           BIGINT  NOT NULL,
    partei_id    BIGINT  NOT NULL,
    wahlkreis_id BIGINT  NOT NULL,
    jahr         INTEGER NOT NULL,
    stimmen      BIGINT  NOT NULL,
    CONSTRAINT pk_zweitestimme_aggr PRIMARY KEY (id)
);

ALTER TABLE kandidatur
    ADD CONSTRAINT kandidaturEinmaligProJahr UNIQUE (nachname, vorname, geburtsjahr, jahr);

ALTER TABLE partei
    ADD CONSTRAINT parteiNameUnique UNIQUE (kurzbezeichnung, wahlkreis_id);

ALTER TABLE bevoelkerung
    ADD CONSTRAINT FK_BEVOELKERUNG_ON_BUNDESLAND FOREIGN KEY (bundesland_id) REFERENCES bundesland (id);

ALTER TABLE erststimme
    ADD CONSTRAINT FK_ERSTSTIMME_ON_PARTEI FOREIGN KEY (partei_id) REFERENCES partei (id);

ALTER TABLE erststimme
    ADD CONSTRAINT FK_ERSTSTIMME_ON_WAHLKREIS FOREIGN KEY (wahlkreis_id) REFERENCES wahlkreis (id);

ALTER TABLE kandidatur
    ADD CONSTRAINT FK_KANDIDATUR_ON_BUNDESLAND FOREIGN KEY (bundesland_id) REFERENCES bundesland (id);

ALTER TABLE kandidatur
    ADD CONSTRAINT FK_KANDIDATUR_ON_PARTEI FOREIGN KEY (partei_id) REFERENCES partei (id);

ALTER TABLE kandidatur
    ADD CONSTRAINT FK_KANDIDATUR_ON_WAHLKREIS FOREIGN KEY (wahlkreis_id) REFERENCES wahlkreis (id);

ALTER TABLE minderheitspartei
    ADD CONSTRAINT FK_MINDERHEITSPARTEI_ON_PARTEI FOREIGN KEY (partei_id) REFERENCES partei (id);

ALTER TABLE partei
    ADD CONSTRAINT FK_PARTEI_ON_WAHLKREIS FOREIGN KEY (wahlkreis_id) REFERENCES wahlkreis (id);

ALTER TABLE partei_wahl_teilnahme
    ADD CONSTRAINT FK_PARTEI_WAHL_TEILNAHME_ON_PARTEI FOREIGN KEY (partei_id) REFERENCES partei (id);

ALTER TABLE wahlkreis
    ADD CONSTRAINT FK_WAHLKREIS_ON_BUNDESLAND FOREIGN KEY (bundesland_id) REFERENCES bundesland (id);

ALTER TABLE zweitestimme
    ADD CONSTRAINT FK_ZWEITESTIMME_ON_PARTEI FOREIGN KEY (partei_id) REFERENCES partei (id);

ALTER TABLE zweitestimme
    ADD CONSTRAINT FK_ZWEITESTIMME_ON_WAHLKREIS FOREIGN KEY (wahlkreis_id) REFERENCES wahlkreis (id);