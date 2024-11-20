package db.in.tum.de.datenbanken.schema.partei;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * Information about which party participated in which election
 * This table could be unnecessary
 */
@Getter
@Setter
@Entity
@Table(name="parteiWahlTeilnahme")
public class ParteiWahlTeilnahme {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "parteiWahlTeilnahme_seq")
    @SequenceGenerator(name = "parteiWahlTeilnahme_seq", allocationSize = 1)
    @Column(name = "id", nullable = false)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "partei_id", nullable = false)
    private Partei partei;

    @Column(name = "jahr", nullable = false)
    private int jahr;
}
