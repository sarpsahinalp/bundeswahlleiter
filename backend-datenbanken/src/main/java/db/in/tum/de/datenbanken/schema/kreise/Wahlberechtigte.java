package db.in.tum.de.datenbanken.schema.kreise;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "wahlberechtigte")
public class Wahlberechtigte {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "wahlberechtigte_seq")
    @SequenceGenerator(name = "wahlberechtigte_seq", allocationSize = 1)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "wahlkreis_id", nullable = false)
    private Wahlkreis wahlkreis;

    @Column(name = "jahr", nullable = false)
    private int jahr;

    @Column(name = "wahlberechtigte", nullable = false)
    private int wahlberechtigte;
}
