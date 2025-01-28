package db.in.tum.de.datenbanken.logic.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Map;

@Data
@AllArgsConstructor
public class SocioCulturalStatsDTO {
    private String winningParty;
    private String wahlkreisName;
    private String type;
    private double svbInsgesamt;
    private double svbLandwFischerei;
    private double svbProduzGewerbe;
    private double svbHandelGastVerkehr;
    private double svbDienstleister;
    private double alterUnter18;
    private double alter1824;
    private double alter2534;
    private double alter3559;
    private double alter6074;
    private double alter75Plus;
    private double alqFrauen;
    private double alq1524;
    private double alq5564;
    private double alqInsgesamt;
    private double alqMaenner;


    public SocioCulturalStatsDTO(Object[] data) {
        winningParty = (String) data[0];
        wahlkreisName = (String) data[1];
        type = (String) data[2];
        svbInsgesamt = (double) data[3];
        svbLandwFischerei = (double) data[4];
        svbProduzGewerbe = (double) data[5];
        svbHandelGastVerkehr = (double) data[6];
        svbDienstleister = (double) data[7];
        alterUnter18 = (double) data[8];
        alter1824 = (double) data[9];
        alter2534 = (double) data[10];
        alter3559 = (double) data[11];
        alter6074 = (double) data[12];
        alter75Plus = (double) data[13];
        alqFrauen = (double) data[14];
        alq1524 = (double) data[15];
        alq5564 = (double) data[16];
        alqInsgesamt = (double) data[17];
        alqMaenner = (double) data[18];
    }
}
