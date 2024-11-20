package db.in.tum.de.datenbanken.schema.partei;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "partei")
public class Partei {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "partei_seq")
    @SequenceGenerator(name = "partei_seq", allocationSize = 1)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "kurzbezeichnung", nullable = false, unique = true)
    private String kurzbezeichnung;

    @Column(name = "Zusatzbezeichnung")
    private String zusatzbezeichnung;

    @Column(name = "isEinzelbewerber", nullable = false)
    private boolean isEinzelbewerber;
}