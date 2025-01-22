package db.in.tum.de.datenbanken.logic.DTOs.voting;

public record ErstestimmeOptionen(
        String vorname,
        String nachname,
        int wahlkreis_id,
        String kurzbezeichnung
) {
    public ErstestimmeOptionen(Object[] data) {
        this((String) data[0], (String) data[1], (int) data[2], (String) data[3]);
    }
}
