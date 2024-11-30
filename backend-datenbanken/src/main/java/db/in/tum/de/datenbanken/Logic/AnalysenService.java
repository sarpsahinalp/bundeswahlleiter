package db.in.tum.de.datenbanken.Logic;

import db.in.tum.de.datenbanken.Logic.DTOs.WahlkreisSiegerDTO;
import lombok.AllArgsConstructor;

import java.util.List;

@org.springframework.stereotype.Service
@AllArgsConstructor
public class AnalysenService {

    public final AnalysenRepository analysenRepository;

    public List<WahlkreisSiegerDTO> getBundesland(int jahr){
        return analysenRepository.getWahlkreisSieger(jahr)
                .stream().map(WahlkreisSiegerDTO::new).toList();
    }
}
