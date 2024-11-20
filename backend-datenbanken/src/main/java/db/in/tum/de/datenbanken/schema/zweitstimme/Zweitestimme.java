package db.in.tum.de.datenbanken.schema.zweitstimme;

import db.in.tum.de.datenbanken.schema.kreise.Wahlkreis;
import db.in.tum.de.datenbanken.schema.partei.Partei;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "zweitestimme")
public class Zweitestimme {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "zweitestimme_seq")
    @SequenceGenerator(name = "zweitestimme_seq", allocationSize = 1)
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