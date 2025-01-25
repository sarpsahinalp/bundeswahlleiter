package db.in.tum.de.datenbanken.logic.DTOs.voting;

public record ErstestimmeOptionen(
        String vorname,
        String nachname,
        long wahlkreis_id,
        String partyKurzbezeichnung,
        long partei_id

) {
    public ErstestimmeOptionen(Object[] data) {
        this((String) data[0], (String) data[1], (long) data[2], (String) data[3], (long) data[4]);
    }
}
