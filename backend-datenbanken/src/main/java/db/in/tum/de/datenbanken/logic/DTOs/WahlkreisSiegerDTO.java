package db.in.tum.de.datenbanken.logic.DTOs;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class WahlkreisSiegerDTO {
    private Long wahlkreisId;
    private String wahlkreisName;
    private String parteiNameErstStimme;
    private String parteiNameZweitStimme;

    public WahlkreisSiegerDTO(Object[] entity){
        wahlkreisId = (Long) entity[0];
        wahlkreisName = (String) entity[1];
        parteiNameErstStimme = (String) entity[2];
        parteiNameZweitStimme = (String) entity[3];
    }
}
