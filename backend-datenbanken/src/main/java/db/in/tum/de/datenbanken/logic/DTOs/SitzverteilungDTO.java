package db.in.tum.de.datenbanken.logic.DTOs;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SitzverteilungDTO {
    private String kurzbezeichnung;
    private int sitze;
    private Integer prevSitze;

    public SitzverteilungDTO(Object[] entity){
        kurzbezeichnung = (String) entity[0];
        sitze = (Integer) entity[1];
        prevSitze = (Integer) entity[2];
    }
}
