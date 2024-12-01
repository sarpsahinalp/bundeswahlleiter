package db.in.tum.de.datenbanken.Logic;

import db.in.tum.de.datenbanken.Logic.DTOs.SitzverteilungDTO;
import db.in.tum.de.datenbanken.Logic.DTOs.UberhangMandateDTO;
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
}
