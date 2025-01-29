package db.in.tum.de.datenbanken.logic;

import db.in.tum.de.datenbanken.logic.DTOs.*;
import db.in.tum.de.datenbanken.logic.DTOs.live.LiveAnalysisDTO;
import db.in.tum.de.datenbanken.logic.DTOs.live.PartyResult;
import db.in.tum.de.datenbanken.logic.admin.ElectionService;
import db.in.tum.de.datenbanken.schema.election.Election;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class AnalysenService {

    public final AnalysenRepository analysenRepository;
    public final ElectionService electionService;

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

    public LiveAnalysisDTO getLiveAnalysis() {
        // Get data from repository
        List<Object[]> firstVotesRaw = analysenRepository.findFirstVotesNative();
        List<Object[]> secondVotesRaw = analysenRepository.findSecondVotesNative();

        // Get active election
        if (electionService.getActiveElection().isEmpty()) {
            return null;
        }

        Election activeElection = electionService.getActiveElection().get();
        long votesCount = electionService.getCountOfSubmittedVotes(activeElection.getId());

        // Map each row in Object[] -> PartyResult
        List<PartyResult> firstVotes = mapToPartyResults(firstVotesRaw);
        List<PartyResult> secondVotes = mapToPartyResults(secondVotesRaw);

        // Create and return the response
        return new LiveAnalysisDTO(firstVotes, secondVotes, votesCount);
    }

    private List<PartyResult> mapToPartyResults(List<Object[]> rawData) {
        return rawData.stream()
                .map(row -> {
                    // row indices must match your SELECT order
                    String party = (String) row[0];
                    String wahlkreis = (String) row[1];
                    int firstVotes = ((Number) row[2]).intValue();
                    int secondVotes = ((Number) row[3]).intValue();
                    int seats = ((Number) row[4]).intValue();
                    double percentage = ((Number) row[5]).doubleValue();
                    return new PartyResult(party, wahlkreis, firstVotes, secondVotes, seats, percentage);
                })
                .toList();
    }

}
