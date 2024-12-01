package db.in.tum.de.datenbanken.Logic.DTOs;

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
}
