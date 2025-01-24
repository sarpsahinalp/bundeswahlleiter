package db.in.tum.de.datenbanken.logic.DTOs;

import db.in.tum.de.datenbanken.schema.kreise.Wahlkreis;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WahlkreiseDTO {
    private long id;
    private String name;

    public WahlkreiseDTO(Object[] entity) {
        id = (Long) entity[0];
        name = entity[1].toString();
    }

    public WahlkreiseDTO(Wahlkreis w) {
        id = w.getId();
        name = w.getName();
    }
}
