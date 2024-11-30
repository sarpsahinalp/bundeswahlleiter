package db.in.tum.de.datenbanken.Logic;

import db.in.tum.de.datenbanken.Logic.DTOs.SitzverteilungDTO;
import db.in.tum.de.datenbanken.Logic.DTOs.WahlkreisSiegerDTO;
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

    @GetMapping("/wahlkreisSieger/{year}")
    public ResponseEntity<List<WahlkreisSiegerDTO>> getBundesland(@PathVariable("year") int year) {
        return ResponseEntity.ok(wahlkreisAnalysenService.getBundesland(year));
    }

    @GetMapping("/sitzverteilung/{year}")
    public ResponseEntity<List<SitzverteilungDTO>> getSitzverteilung(@PathVariable("year") int year) {
        return ResponseEntity.ok(wahlkreisAnalysenService.getSitzverteilung(year));
    }

}
