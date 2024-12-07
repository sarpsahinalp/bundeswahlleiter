CREATE SEQUENCE IF NOT EXISTS wahlberechtigte_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE wahlberechtigte
(
    id              BIGINT  NOT NULL,
    wahlkreis_id    BIGINT  NOT NULL,
    jahr            INTEGER NOT NULL,
    wahlberechtigte INTEGER NOT NULL,
    CONSTRAINT pk_wahlberechtigte PRIMARY KEY (id)
);

ALTER TABLE wahlberechtigte
    ADD CONSTRAINT FK_WAHLBERECHTIGTE_ON_WAHLKREIS FOREIGN KEY (wahlkreis_id) REFERENCES wahlkreis (id);

