package db.in.tum.de.datenbanken.schema.kandidatur;

import db.in.tum.de.datenbanken.schema.kreise.Bundesland;
import db.in.tum.de.datenbanken.schema.kreise.Wahlkreis;
import db.in.tum.de.datenbanken.schema.partei.Partei;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "kandidatur", uniqueConstraints = {@UniqueConstraint(name = "kandidaturEinmaligProJahr",columnNames = {
        "nachname",
        "vorname",
        "geburtsjahr",
        "jahr",
})})
public class Kandidatur {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "kandidatur_seq")
    @SequenceGenerator(name = "kandidatur_seq", allocationSize = 1)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "nachname", nullable = false)
    private String nachname;

    @Column(name = "vorname", nullable = false)
    private String vorname;

    @Column(name = "geburtsjahr", nullable = false)
    private int geburtsjahr;

    @ManyToOne
    @JoinColumn(name = "partei_id")
    private Partei partei;

    @ManyToOne
    @JoinColumn(name = "wahlkreis_id")
    private Wahlkreis wahlkreis;

    @ManyToOne
    @JoinColumn(name = "bundesland_id")
    private Bundesland bundesland;

    @Column(name = "landesliste_platz")
    private Integer landeslistePlatz;

    @Column(name = "jahr", nullable = false)
    private int jahr;
}