package db.in.tum.de.datenbanken.logic.DTOs.voting;

public record ZweitestimmeOptionen(
        String vorname,
        String nachname,
        int landesliste_platz,
        int bundesland_id,
        String kurzbezeichnung
) {
    public ZweitestimmeOptionen(Object[] data) {
        this((String) data[0], (String) data[1], (int) data[2], (int) data[3], (String) data[4]);
    }
}
