package db.in.tum.de.datenbanken.logic.DTOs;

import lombok.Getter;

@Getter
public class MandateDTO {
    private final String vorname;
    private final String nachname;
    private final String partei;

    public MandateDTO(Object[] entity) {
        vorname = (String) entity[0];
        nachname = (String) entity[1];
        partei = (String) entity[2];
    }
}
