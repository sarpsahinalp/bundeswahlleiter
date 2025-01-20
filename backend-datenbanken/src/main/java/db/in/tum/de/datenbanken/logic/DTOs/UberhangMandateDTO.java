package db.in.tum.de.datenbanken.logic.DTOs;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.math.BigDecimal;

@JsonInclude(JsonInclude.Include.NON_EMPTY)
public record UberhangMandateDTO(
        String groupField, // bundesland or partei
        BigDecimal mandates
) {
    public UberhangMandateDTO(Object[] entity) {
        this(
                (String) entity[0],  // bundesland
                (BigDecimal) entity[1]  // partei
        );
    }
}
