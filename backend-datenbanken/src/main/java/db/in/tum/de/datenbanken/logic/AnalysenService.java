package db.in.tum.de.datenbanken.logic;

import db.in.tum.de.datenbanken.logic.DTOs.*;
import lombok.AllArgsConstructor;

import java.util.*;

@org.springframework.stereotype.Service
@AllArgsConstructor
public class AnalysenService {

    public final AnalysenRepository analysenRepository;

    public List<WahlkreisSiegerDTO> getWahlkreisSieger(int jahr){
        return analysenRepository.getWahlkreisSieger(jahr)
                .stream().map(WahlkreisSiegerDTO::new).toList();
    }

    public List<SitzverteilungDTO> getSitzverteilung(int jahr){
        return analysenRepository.getSitzverteilung(jahr)
                .stream().map(SitzverteilungDTO::new).toList();
    }

    public List<UberhangMandateDTO> getUeberhangmandate(int year, String grouping){
        if (!grouping.equals("bundesland") && !grouping.equals("partei")) {
            throw new IllegalArgumentException("Invalid groupBy parameter. Must be 'bundesland' or 'partei'.");
        }

        return analysenRepository.getUberhangmandate(year, grouping)
                .stream().map(UberhangMandateDTO::new).toList();
    }

    public List<WahlkreiseDTO> getWahlkreise(){
        return analysenRepository.getWahlkreise()
                .stream().map(WahlkreiseDTO::new).toList();
    }

    public WahlkreisUebersichtDTO getWahlkreisUebersicht(int year, int wahlkreis_id, boolean useAggregation){
        List<Object[]> gewaehltenDirektkandidaten = analysenRepository.getGewaehltenDirektkandidaten(year, wahlkreis_id, useAggregation);
        List<Object[]> wahlbeteiligung = analysenRepository.getWahlbeteiligung(year, wahlkreis_id, useAggregation);
        List<Object[]> wahlkreisUebersicht = analysenRepository.getWahlkreisUebersicht(year, wahlkreis_id, useAggregation);
        return new WahlkreisUebersichtDTO(
                gewaehltenDirektkandidaten.getFirst(),
                wahlbeteiligung.getFirst(),
                wahlkreisUebersicht
        );
    }

    public List<KnappsteSiegerDTO> getKnappsteSieger(int year){
        List<KnappsteSiegerDTO> results = new ArrayList<>();
        List<Object[]> queryResults = analysenRepository.getKnappsteSiegerErstStimme(year);

        for (Object[] row : queryResults) {
            String parteiName = (String) row[0];
            String  wahlkreisId = ((String) row[1]);
            String typ = (String) row[2];
            int stimmen = ((Number) row[3]).intValue();
            int differenz = ((Number) row[4]).intValue();

            results.add(new KnappsteSiegerDTO(parteiName, wahlkreisId, typ, stimmen, differenz));
        }

        return results;
    }

    public List<NonVoterDTO> getNonVoters(int year, String erststimme) {
        List<Object[]> results = analysenRepository.getNonVotersProStimmen(year, erststimme);
        return results.stream().map(record ->
                new NonVoterDTO(
                        (String) record[0], // wahlkreis name
                        ((Number) record[1]).intValue(), // nonVoters
                        (String) record[2]  // type
                )
        ).toList();
    }

    public List<MandateDTO> getBundesTagsMitglieder(int year, long bundesland_id) {
        return analysenRepository.getListenPlatze(year, bundesland_id).stream()
                .map(MandateDTO::new).toList();
    }

    public List<BundeslandDTO> getBundesLander(){
        return analysenRepository.getBundesLander().stream().map(BundeslandDTO::new).toList();
    }

    public List<SocioCulturalStatsDTO> getSocioCulturalStats(int year){
        List<Object[]> results = analysenRepository.getSozioKulturellProPartei(year);
        return results.stream().map(this::mapObjectArrayToDto).toList();
    }

    private SocioCulturalStatsDTO mapObjectArrayToDto(Object[] obj) {
//        SocioCulturalStatsDTO dto = new SocioCulturalStatsDTO();
//        dto.setWinningParty((Long) obj[0]);
//        dto.setType((String) obj[1]);
//        dto.setSvbInsgesamt((Double) obj[2]);
//        dto.setSvbLandwFischerei((Double) obj[3]);
//        dto.setSvbProduzGewerbe((Double) obj[4]);
//        dto.setSvbHandelGastVerkehr((Double) obj[5]);
//        dto.setSvbDienstleister((Double) obj[6]);
//        dto.setSvbUebrigeDienstleister((Double) obj[7]);
//        dto.setAlterUnter18((Double) obj[8]);
//        dto.setAlter1824((Double) obj[9]);
//        dto.setAlter2534((Double) obj[10]);
//        dto.setAlter3559((Double) obj[11]);
//        dto.setAlter6074((Double) obj[12]);
//        dto.setAlter75Plus((Double) obj[13]);
//        dto.setAlqFrauen((Double) obj[14]);
//        dto.setAlq1524((Double) obj[15]);
//        dto.setAlq5564((Double) obj[16]);
//        dto.setAlqInsgesamt((Double) obj[17]);
//        dto.setAlqMaenner((Double) obj[18]);
//        return dto;
        return null;
    }

}
