CREATE SEQUENCE IF NOT EXISTS minderheitspartei_seq START WITH 1 INCREMENT BY 50;

CREATE TABLE minderheitspartei
(
    id        BIGINT NOT NULL,
    partei_id BIGINT,
    CONSTRAINT pk_minderheitspartei PRIMARY KEY (id)
);

ALTER TABLE minderheitspartei
    ADD CONSTRAINT FK_MINDERHEITSPARTEI_ON_PARTEI FOREIGN KEY (partei_id) REFERENCES partei (id);
