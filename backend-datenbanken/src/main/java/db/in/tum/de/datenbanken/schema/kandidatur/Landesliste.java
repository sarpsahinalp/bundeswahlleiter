package db.in.tum.de.datenbanken.schema.kandidatur;

import db.in.tum.de.datenbanken.schema.kreise.Bundesland;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "landesliste")
public class Landesliste {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "landesliste_seq")
    @SequenceGenerator(name = "landesliste_seq", allocationSize = 1)
    @Column(name = "id", nullable = false)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "kandidatur_id", nullable = false)
    private Kandidatur kandidatur;

    @ManyToOne
    @JoinColumn(name = "bundesland_id", nullable = false)
    private Bundesland bundesland;

    @Column(name = "listenplatz")
    private int listenplatz;
}
