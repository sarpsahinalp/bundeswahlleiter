package db.in.tum.de.datenbanken.logic;

import db.in.tum.de.datenbanken.logic.DTOs.*;
import lombok.AllArgsConstructor;

import java.util.*;

@org.springframework.stereotype.Service
@AllArgsConstructor
public class AnalysenService {

    public final AnalysenRepository analysenRepository;

    public boolean isJahrDenied(int jahr) {
        return ! (boolean) analysenRepository.isJahrAllowed(jahr).getFirst()[0];
    }

    public List<Integer> getJahre() {
        return analysenRepository.getJahre()
                .stream().map(objArr -> (int) objArr[0]).toList();
    }

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

    public List<SocioCulturalStatsDTO> getSocioCulturalStats(String type, int year){
        List<Object[]> results = analysenRepository.getSozioKulturellProPartei(type, year);
        return results.stream().map(SocioCulturalStatsDTO::new).toList();
    }

}
