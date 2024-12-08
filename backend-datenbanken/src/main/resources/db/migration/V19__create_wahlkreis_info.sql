CREATE SEQUENCE IF NOT EXISTS wahlkreis_soziokulturell_info_seq START WITH 1 INCREMENT BY 1;

create table wahlkreis_soziokulturell_info (
    id BIGINT primary key default nextval('wahlkreis_soziokulturell_info_seq'),
    wahlkreis_id BIGINT not null references wahlkreis(id),
    SVB_INSGESAMT FLOAT,
    SVB_landw_fischerei FLOAT,
    SVB_produz_gewerbe FLOAT,
    SVB_handel_gast_verkehr FLOAT,
    SVB_dienstleister FLOAT,
    SVB_uebrige_dienstleister FLOAT,
    Alter_unter_18 FLOAT,
    Alter_18_24 FLOAT,
    Alter_25_34 FLOAT,
    Alter_35_59 FLOAT,
    Alter_60_74 FLOAT,
    Alter_75_plus FLOAT,
    ALQ_frauen FLOAT,
    ALQ_15_24 FLOAT,
    ALQ_55_64 FLOAT,
    ALQ_insgesamt FLOAT,
    ALQ_maenner FLOAT,
    year integer not null
);