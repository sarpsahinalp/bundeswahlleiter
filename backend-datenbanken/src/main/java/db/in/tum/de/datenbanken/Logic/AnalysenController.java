package db.in.tum.de.datenbanken.Logic;

import db.in.tum.de.datenbanken.Logic.DTOs.*;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(value = "/ergebnisse")
@AllArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AnalysenController {

    private final AnalysenService wahlkreisAnalysenService;
    private final AnalysenService analysenService;

    @GetMapping("/wahlkreisSieger/{year}")
    public ResponseEntity<List<WahlkreisSiegerDTO>> getBundesland(@PathVariable("year") int year) {
        return ResponseEntity.ok(wahlkreisAnalysenService.getBundesland(year));
    }

    @GetMapping("/sitzverteilung/{year}")
    public ResponseEntity<List<SitzverteilungDTO>> getSitzverteilung(@PathVariable("year") int year) {
        return ResponseEntity.ok(wahlkreisAnalysenService.getSitzverteilung(year));
    }

    @GetMapping("/ueberhangmandate/{year}/{grouping}")
    public ResponseEntity<List<UberhangMandateDTO>> getUeberhangmandate(@PathVariable("year") int year, @PathVariable("grouping") String grouping) {
        return ResponseEntity.ok(wahlkreisAnalysenService.getUeberhangmandate(year, grouping));
    }

    @GetMapping("/wahlkreise")
    public ResponseEntity<List<WahlkreiseDTO>> getWahlkreise() {
        return ResponseEntity.ok(wahlkreisAnalysenService.getWahlkreise());
    }

    @GetMapping("/wahlkreis/uebersicht/{year}/{wahlkreis_id}/{useAggregation}")
    public ResponseEntity<WahlkreisUebersichtDTO> getWahlkreisUebersicht(
            @PathVariable("year") int year,
            @PathVariable("wahlkreis_id") int wahlkreis_id,
            @PathVariable("useAggregation") boolean useAggregation
    ) {
        return ResponseEntity.ok(wahlkreisAnalysenService.getWahlkreisUebersicht(year, wahlkreis_id, useAggregation));
    }

    @GetMapping("/knappsteSieger/{year}")
    public ResponseEntity<List<KnappsteSiegerDTO>> getKnappsteSieger(@PathVariable("year") int year) {
        return ResponseEntity.ok(wahlkreisAnalysenService.getKnappsteSieger(year));
    }

    @GetMapping("/nonVoters/{year}/{erststimme}")
    public List<NonVoterDTO> getNonVoters(
            @PathVariable("year") int year,
            @PathVariable("erststimme") String erststimme
    ) {
        return analysenService.getNonVoters(year, erststimme);
    }

}
