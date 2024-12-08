package db.in.tum.de.datenbanken.Logic.DTOs;

import lombok.Getter;

@Getter
public class MandateDTO {
    private final String vorname;
    private final String nachname;
    private final String partei;
    private final long wahlkreis_id;

    public MandateDTO(Object[] entity) {
        vorname = (String) entity[0];
        nachname = (String) entity[1];
        partei = (String) entity[2];
        wahlkreis_id = (long) entity[3];
    }
}
