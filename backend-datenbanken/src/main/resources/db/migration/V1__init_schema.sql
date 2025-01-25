CREATE SEQUENCE IF NOT EXISTS bevoelkerung_seq START WITH 1 INCREMENT BY 1;

CREATE SEQUENCE IF NOT EXISTS bundesland_seq START WITH 1 INCREMENT BY 1;

CREATE SEQUENCE IF NOT EXISTS elections_seq START WITH 1 INCREMENT BY 1;

CREATE SEQUENCE IF NOT EXISTS erststimme_aggr_seq START WITH 1 INCREMENT BY 50;

CREATE SEQUENCE IF NOT EXISTS erststimme_seq START WITH 1 INCREMENT BY 1;

CREATE SEQUENCE IF NOT EXISTS kandidatur_seq START WITH 1 INCREMENT BY 1;

CREATE SEQUENCE IF NOT EXISTS minderheitspartei_seq START WITH 1 INCREMENT BY 50;

CREATE SEQUENCE IF NOT EXISTS partei_seq START WITH 1 INCREMENT BY 1;

CREATE SEQUENCE IF NOT EXISTS partei_wahl_teilnahme_seq START WITH 1 INCREMENT BY 1;

CREATE SEQUENCE IF NOT EXISTS wahlberechtigte_seq START WITH 1 INCREMENT BY 1;

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

CREATE TABLE elections
(
    id          BIGINT                      NOT NULL,
    start_time  TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    year        INTEGER UNIQUE              NOT NULL,
    status      VARCHAR(255)                NOT NULL,
    total_votes BIGINT                      NOT NULL,
    CONSTRAINT pk_elections PRIMARY KEY (id)
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
    titel             VARCHAR(255),
    namenszusatz      VARCHAR(255),
    wohnort           VARCHAR(255),
    beruf             VARCHAR(255),
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

CREATE TABLE vote_code
(
    code         VARCHAR(255) NOT NULL,
    wahlkreis_id BIGINT       NOT NULL,
    election_id  BIGINT       NOT NULL,
    CONSTRAINT pk_vote_code PRIMARY KEY (code)
);

CREATE TABLE wahlberechtigte
(
    id              BIGINT  NOT NULL,
    wahlkreis_id    BIGINT  NOT NULL,
    jahr            INTEGER NOT NULL,
    wahlberechtigte INTEGER NOT NULL,
    CONSTRAINT pk_wahlberechtigte PRIMARY KEY (id)
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

ALTER TABLE vote_code
    ADD CONSTRAINT FK_VOTE_CODE_ON_ELECTION FOREIGN KEY (election_id) REFERENCES elections (id);

ALTER TABLE vote_code
    ADD CONSTRAINT FK_VOTE_CODE_ON_WAHLKREIS FOREIGN KEY (wahlkreis_id) REFERENCES wahlkreis (id);

ALTER TABLE wahlberechtigte
    ADD CONSTRAINT FK_WAHLBERECHTIGTE_ON_WAHLKREIS FOREIGN KEY (wahlkreis_id) REFERENCES wahlkreis (id);

ALTER TABLE wahlkreis
    ADD CONSTRAINT FK_WAHLKREIS_ON_BUNDESLAND FOREIGN KEY (bundesland_id) REFERENCES bundesland (id);

ALTER TABLE zweitestimme
    ADD CONSTRAINT FK_ZWEITESTIMME_ON_PARTEI FOREIGN KEY (partei_id) REFERENCES partei (id);

ALTER TABLE zweitestimme
    ADD CONSTRAINT FK_ZWEITESTIMME_ON_WAHLKREIS FOREIGN KEY (wahlkreis_id) REFERENCES wahlkreis (id);

-- Indexes ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_partei_name
    ON partei (name);

CREATE INDEX IF NOT EXISTS idx_kandidatur_jahr
    ON kandidatur (jahr);

CREATE INDEX IF NOT EXISTS idx_minderheitspartei_partei
    ON minderheitspartei (partei_id);

CREATE UNIQUE INDEX unique_active_election ON elections (status) WHERE status = 'ACTIVE';