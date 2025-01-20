package db.in.tum.de.datenbanken.logic;

import db.in.tum.de.datenbanken.logic.DTOs.*;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(value = "/ergebnisse")
@AllArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
// TODO: Add security, authentication and authorization
// TODO: Write description for each endpoint and explain in detail the queries in the repository
public class AnalysenController {

    private final AnalysenService wahlkreisAnalysenService;
    private final AnalysenService analysenService;

    @GetMapping("/wahlkreisSieger/{year}")
    @Transactional(readOnly = true)
    public ResponseEntity<List<WahlkreisSiegerDTO>> getBundesland(@PathVariable("year") int year) {
        return ResponseEntity.ok(wahlkreisAnalysenService.getWahlkreisSieger(year));
    }

    @GetMapping("/sitzverteilung/{year}")
    @Transactional(readOnly = true)
    public ResponseEntity<List<SitzverteilungDTO>> getSitzverteilung(@PathVariable("year") int year) {
        return ResponseEntity.ok(wahlkreisAnalysenService.getSitzverteilung(year));
    }

    @GetMapping("/ueberhangmandate/{year}/{grouping}")
    @Transactional(readOnly = true)
    public ResponseEntity<List<UberhangMandateDTO>> getUeberhangmandate(@PathVariable("year") int year, @PathVariable("grouping") String grouping) {
        return ResponseEntity.ok(wahlkreisAnalysenService.getUeberhangmandate(year, grouping));
    }

    @GetMapping("/wahlkreise")
    @Transactional(readOnly = true)
    public ResponseEntity<List<WahlkreiseDTO>> getWahlkreise() {
        return ResponseEntity.ok(wahlkreisAnalysenService.getWahlkreise());
    }

    @GetMapping("/wahlkreis/uebersicht/{year}/{wahlkreis_id}/{useAggregation}")
    @Transactional(readOnly = true)
    public ResponseEntity<WahlkreisUebersichtDTO> getWahlkreisUebersicht(
            @PathVariable("year") int year,
            @PathVariable("wahlkreis_id") int wahlkreis_id,
            @PathVariable("useAggregation") boolean useAggregation
    ) {
        return ResponseEntity.ok(wahlkreisAnalysenService.getWahlkreisUebersicht(year, wahlkreis_id, useAggregation));
    }

    @GetMapping("/knappsteSieger/{year}")
    @Transactional(readOnly = true)
    public ResponseEntity<List<KnappsteSiegerDTO>> getKnappsteSieger(@PathVariable("year") int year) {
        return ResponseEntity.ok(wahlkreisAnalysenService.getKnappsteSieger(year));
    }

    @GetMapping("/nonVoters/{year}/{erststimme}")
    @Transactional(readOnly = true)
    public List<NonVoterDTO> getNonVoters(
            @PathVariable("year") int year,
            @PathVariable("erststimme") String erststimme
    ) {
        return analysenService.getNonVoters(year, erststimme);
    }

    @GetMapping("/bundestagsmitglieder/{year}/{bundesland_id}")
    @Transactional(readOnly = true)
    public ResponseEntity<List<MandateDTO>> getBundestagsMitglieder(
            @PathVariable("year") int year,
            @PathVariable("bundesland_id") long bundesland_id
    ) {
        return ResponseEntity.ok(wahlkreisAnalysenService.getBundesTagsMitglieder(year, bundesland_id));
    }

    @GetMapping("/bundeslander")
    @Transactional(readOnly = true)
    public ResponseEntity<List<BundeslandDTO>> getBundeslander() {
        return ResponseEntity.ok(wahlkreisAnalysenService.getBundesLander());
    }

    @GetMapping("/socioCulturalStats/{year}")
    @Transactional(readOnly = true)
    public ResponseEntity<List<SocioCulturalStatsDTO>> getSocioCulturalStats(@PathVariable("year") int year) {
        return ResponseEntity.ok(wahlkreisAnalysenService.getSocioCulturalStats(year));
    }

}
