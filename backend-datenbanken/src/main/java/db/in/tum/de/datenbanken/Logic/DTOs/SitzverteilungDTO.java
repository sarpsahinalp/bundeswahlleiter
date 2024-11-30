package db.in.tum.de.datenbanken.Logic.DTOs;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SitzverteilungDTO {
    private String kurzbezeichnung;
    private int sitze;

    public SitzverteilungDTO(Object[] entity){
        kurzbezeichnung = (String) entity[0];
        sitze = (Integer) entity[1];
    }
}
