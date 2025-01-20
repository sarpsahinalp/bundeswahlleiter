package db.in.tum.de.datenbanken.logic.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Map;

@Data
@AllArgsConstructor
public class SocioCulturalStatsDTO {
    private String winningParty;
    private String type;
    private Map<String, Double> averages; // Key is the indicator name, value is the average.
}
