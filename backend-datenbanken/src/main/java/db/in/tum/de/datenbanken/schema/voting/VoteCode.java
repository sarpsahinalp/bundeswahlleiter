package db.in.tum.de.datenbanken.schema.voting;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
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

    private ZonedDateTime lastModifiedDate;
}