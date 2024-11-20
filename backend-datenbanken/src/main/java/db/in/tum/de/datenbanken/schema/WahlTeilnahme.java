package db.in.tum.de.datenbanken.schema;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "wahl_teilnahme")
public class WahlTeilnahme {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "wahl_teilnahme_seq")
    @SequenceGenerator(name = "wahl_teilnahme_seq")
    @Column(name = "id", nullable = false)
    private Long id;

}