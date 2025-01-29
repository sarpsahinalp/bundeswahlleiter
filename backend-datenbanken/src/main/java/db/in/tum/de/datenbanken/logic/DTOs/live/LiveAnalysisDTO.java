package db.in.tum.de.datenbanken.logic.DTOs.live;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class LiveAnalysisDTO {
    private List<PartyResult> firstVotes;
    private List<PartyResult> secondVotes;
    private long totalVotes;
}
