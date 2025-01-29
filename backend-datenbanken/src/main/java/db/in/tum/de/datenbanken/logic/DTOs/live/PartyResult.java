package db.in.tum.de.datenbanken.logic.DTOs.live;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PartyResult {
    private String party;
    private String wahlkreis;
    private int firstVotes;
    private int secondVotes;
    private int seats;
    private double percentage;
}
