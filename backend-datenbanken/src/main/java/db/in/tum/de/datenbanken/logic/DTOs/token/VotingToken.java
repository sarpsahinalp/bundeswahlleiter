package db.in.tum.de.datenbanken.logic.DTOs.token;

import java.sql.Time;
import java.sql.Timestamp;
import java.util.Date;

public record VotingToken(
        String code,
        int wahlkreis_id,
        Timestamp last_modified_date
) {

    public VotingToken(Object[] data) {
        this((String) data[0], (int) data[1], (Timestamp) data[2]);
    }
}
