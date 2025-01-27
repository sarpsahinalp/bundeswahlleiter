package db.in.tum.de.datenbanken.logic.DTOs.voting;

public record ErstestimmeOptionen(
        String vorname,
        String nachname,
        long wahlkreis_id,
        String partyKurzbezeichnung,
        String partyName,
        long partei_id,
        String titel,
        String beruf,
        String wohnort


) {
    public ErstestimmeOptionen(Object[] data) {
        this(
            (String) data[0],
            (String) data[1],
            (long) data[2],
            (String) data[3],
            (String) data[4],
            (long) data[5],
            (String) data[6],
            (String) data[7],
            (String) data[8]
        );
    }
}
