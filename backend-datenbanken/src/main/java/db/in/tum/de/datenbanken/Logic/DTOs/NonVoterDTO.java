package db.in.tum.de.datenbanken.Logic.DTOs;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class NonVoterDTO {
    private String wahlkreisName;
    private int nonVoters;
    private String type;
}
