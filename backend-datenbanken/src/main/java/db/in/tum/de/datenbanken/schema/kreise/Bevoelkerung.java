package db.in.tum.de.datenbanken.schema.kreise;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "bevoelkerung")
public class Bevoelkerung {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "bevoelkerung_seq")
    @SequenceGenerator(name = "bevoelkerung_seq", allocationSize = 1)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "bundesland_id", nullable = false)
    private Bundesland bundesland;

    @Column(name = "jahr", nullable = false)
    private int jahr;

    @Column(name = "bevoelkerung", nullable = false)
    private Long bevoelkerung;
}