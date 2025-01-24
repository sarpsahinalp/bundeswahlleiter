package db.in.tum.de.datenbanken.configuration.security.dtos;

public record JwtPrincipal(
        String code,
        long wahlkreis_id,
        int year

) {}
