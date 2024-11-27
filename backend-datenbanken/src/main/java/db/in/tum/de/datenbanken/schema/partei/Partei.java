package db.in.tum.de.datenbanken.schema.partei;

import db.in.tum.de.datenbanken.schema.kreise.Wahlkreis;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "partei", uniqueConstraints = {@UniqueConstraint(name = "parteiNameUnique", columnNames = {
        "kurzbezeichnung",
        "wahlkreis_id",
})})
public class Partei {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "partei_seq")
    @SequenceGenerator(name = "partei_seq", allocationSize = 1)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "kurzbezeichnung", nullable = false)
    private String kurzbezeichnung;

    @Column(name = "zusatzbezeichnung")
    private String zusatzbezeichnung;

    @ManyToOne
    @JoinColumn(name = "wahlkreis_id")
    private Wahlkreis wahlkreis;

    @Column(name = "is_einzelbewerber", nullable = false)
    private boolean isEinzelbewerber;
}