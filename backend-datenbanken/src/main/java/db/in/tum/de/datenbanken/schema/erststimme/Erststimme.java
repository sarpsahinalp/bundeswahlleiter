package db.in.tum.de.datenbanken.schema.erststimme;

import db.in.tum.de.datenbanken.schema.kreise.Wahlkreis;
import db.in.tum.de.datenbanken.schema.partei.Partei;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "erststimme")
public class Erststimme {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "erststimme_seq")
    @SequenceGenerator(name = "erststimme_seq", allocationSize = 1)
    @Column(name = "id", nullable = false)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "partei_id", nullable = false)
    private Partei partei;

    @ManyToOne
    @JoinColumn(name = "wahlkreis_id", nullable = false)
    private Wahlkreis wahlkreis;

    @Column(name = "jahr", nullable = false)
    private int jahr;

}