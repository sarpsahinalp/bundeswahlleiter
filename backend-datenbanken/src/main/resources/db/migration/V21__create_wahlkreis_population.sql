CREATE SEQUENCE IF NOT EXISTS population_wahlkreis_seq START WITH 1 INCREMENT BY 1;

create table population_wahlkreis
(
    id                        BIGINT primary key default nextval('population_wahlkreis_seq'),
    wahlkreis_id              BIGINT  not null references wahlkreis (id),
    population                BIGINT  not null,
    year                      integer not null
);