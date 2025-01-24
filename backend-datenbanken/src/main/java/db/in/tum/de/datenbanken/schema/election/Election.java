package db.in.tum.de.datenbanken.schema.election;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "elections")
public class Election {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "elections_seq")
    @SequenceGenerator(name = "elections_seq", allocationSize = 1)
    @Column(nullable = false)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private int year;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.INACTIVE;

    @Column(nullable = false)
    private long totalVotes;

    public enum Status {
        ACTIVE, INACTIVE
    }
}