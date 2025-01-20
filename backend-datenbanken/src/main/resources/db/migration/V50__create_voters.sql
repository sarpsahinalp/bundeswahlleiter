-- V1__add_20_million_random_uuid_vote_codes.sql

ALTER TABLE vote_code DISABLE TRIGGER ALL;

DO $$
    DECLARE
        counter BIGINT := 1;
        batch_size INTEGER := 10000;
        max_records BIGINT := 200000;
    BEGIN
        WHILE counter <= max_records LOOP
                INSERT INTO vote_code (code, last_modified_date)
                SELECT
                    gen_random_uuid()::TEXT AS code,  -- Generates a random UUID and converts it to text
                    NOW() AS last_modified_date      -- Sets the current timestamp
                FROM generate_series(1, batch_size);

                counter := counter + batch_size;
            END LOOP;
    END $$;

ALTER TABLE vote_code ENABLE TRIGGER ALL;
