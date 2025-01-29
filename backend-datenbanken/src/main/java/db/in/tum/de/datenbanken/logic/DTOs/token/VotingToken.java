package db.in.tum.de.datenbanken.logic.DTOs.token;

public record VotingToken(
        String code,
        long wahlkreis_id,
        int year,
        long election_id
) {

    public VotingToken(Object[] data) {
        this(
                (String) data[0],
                (long) data[1],
                (int) data[2],
                (long) data[3]);
    }
}
