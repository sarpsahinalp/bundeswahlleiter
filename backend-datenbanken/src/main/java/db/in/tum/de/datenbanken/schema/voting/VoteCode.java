package db.in.tum.de.datenbanken.schema.voting;

import db.in.tum.de.datenbanken.schema.kreise.Wahlkreis;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.ZonedDateTime;

@Getter
@Setter
@Entity
@Table(name = "vote_code")
public class VoteCode {

    @Id
    private String code;

    @ManyToOne
    @JoinColumn(name = "wahlkreis_id", nullable = false)
    private Wahlkreis wahlkreisId;

    private ZonedDateTime lastModifiedDate;
}