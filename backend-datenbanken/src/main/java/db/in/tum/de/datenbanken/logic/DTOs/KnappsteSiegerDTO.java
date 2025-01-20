package db.in.tum.de.datenbanken.logic.DTOs;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class KnappsteSiegerDTO {

    private String parteiName;
    private String wahlKreisName;
    private String typ; // "Sieg" or "Niederlage"
    private int stimmen;
    private int differenz;
}
