package db.in.tum.de.datenbanken.logic.DTOs;

import lombok.Getter;

@Getter
public class BundeslandDTO {
    private final long id;
    private final String name;

    public BundeslandDTO(Object[] entity) {
        this.id = (long) entity[0];
        this.name = (String) entity[1];
    }
}
