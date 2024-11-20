package db.in.tum.de.datenbanken.schema.kreise;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "wahlkreis")
public class Wahlkreis {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "wahlkreis_seq")
    @SequenceGenerator(name = "wahlkreis_seq", allocationSize = 1)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @ManyToOne
    @JoinColumn(name = "bundesland_id", nullable = false)
    private Bundesland bundesland;
}