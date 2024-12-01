package db.in.tum.de.datenbanken.Logic.DTOs;

import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
public class WahlkreisUebersichtDTO {
    private final Kandidat direktMandat;
    private final List<ParteiErgebnis> parteiErgebnis;

    public WahlkreisUebersichtDTO(Object[] kandidatEntity, List<Object[]> parteiErgebnisEntity) {
        direktMandat = new Kandidat(
                (String) kandidatEntity[0],
                (String) kandidatEntity[1],
                (String) kandidatEntity[2]
        );
        parteiErgebnis = parteiErgebnisEntity.stream().map(
                entity -> new ParteiErgebnis(
                        (String) entity[0],
                        (long) entity[1],
                        (BigDecimal) entity[2],
                        (Long) entity[3],
                        (BigDecimal) entity[4]
                )
        ).toList();
    }

    public record Kandidat(String vorname, String nachname, String partei) {}
    public record ParteiErgebnis(
            String name,
            long stimmen_abs,
            BigDecimal stimmen_prozent,
            Long stimmen_abs_vergleich,
            BigDecimal stimmen_prozent_vergleich
    ) {}
}
