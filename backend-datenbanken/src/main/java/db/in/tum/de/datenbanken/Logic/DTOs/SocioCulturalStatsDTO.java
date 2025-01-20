package db.in.tum.de.datenbanken.Logic.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SocioCulturalStatsDTO {
    // TODO Change to party name instead
    private Long winningParty;
    private String type;
    private Double svbInsgesamt;
    private Double svbLandwFischerei;
    private Double svbProduzGewerbe;
    private Double svbHandelGastVerkehr;
    private Double svbDienstleister;
    private Double svbUebrigeDienstleister;
    private Double alterUnter18;
    private Double alter1824;
    private Double alter2534;
    private Double alter3559;
    private Double alter6074;
    private Double alter75Plus;
    private Double alqFrauen;
    private Double alq1524;
    private Double alq5564;
    private Double alqInsgesamt;
    private Double alqMaenner;
}
