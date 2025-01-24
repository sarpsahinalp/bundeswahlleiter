package db.in.tum.de.datenbanken.schema.voting;

import db.in.tum.de.datenbanken.schema.election.Election;
import db.in.tum.de.datenbanken.schema.kreise.Wahlkreis;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "vote_code")
public class VoteCode {

    @Id
    @Column(name = "code", nullable = false)
    private String code;

    @ManyToOne
    @JoinColumn(name = "wahlkreis_id", nullable = false)
    private Wahlkreis wahlkreisId;

    @ManyToOne
    @JoinColumn(name = "election_id", nullable = false)
    private Election election;
}