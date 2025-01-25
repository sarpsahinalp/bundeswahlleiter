package db.in.tum.de.datenbanken.logic.DTOs.voting;

public record ZweitestimmeOptionen(
        String vorname,
        String nachname,
        int landesliste_platz,
        long bundesland_id,
        String kurzbezeichnung,
        long partei_id
) {
    public ZweitestimmeOptionen(Object[] data) {
        this((String) data[0], (String) data[1], (int) data[2], (long) data[3], (String) data[4], (long) data[5]);
    }
}
