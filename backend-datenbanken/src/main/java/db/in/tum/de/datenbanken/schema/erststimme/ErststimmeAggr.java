package db.in.tum.de.datenbanken.schema.erststimme;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "erststimme_aggr")
public class ErststimmeAggr {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "erststimme_aggr_seq")
    @SequenceGenerator(name = "erststimme_aggr_seq")
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "partei_id", nullable = false)
    private Long parteiId;

    @Column(name = "wahlkreis_id", nullable = false)
    private Long wahlkreisId;

    @Column(name = "jahr", nullable = false)
    private Integer jahr;

    @Column(name = "stimmen", nullable = false)
    private Long stimmen;

}