package db.in.tum.de.datenbanken.Logic;

import db.in.tum.de.datenbanken.Logic.DTOs.WahlkreisSiegerDTO;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(value = "/ergebnisse")
@AllArgsConstructor
public class AnalysenController {

    private final AnalysenService wahlkreisAnalysenService;

    @GetMapping("/wahlkreisSieger/{year}")
    public ResponseEntity<List<WahlkreisSiegerDTO>> getBundesland(@PathVariable("year") int year) {
        return ResponseEntity.ok(wahlkreisAnalysenService.getBundesland(year));
    }

}
