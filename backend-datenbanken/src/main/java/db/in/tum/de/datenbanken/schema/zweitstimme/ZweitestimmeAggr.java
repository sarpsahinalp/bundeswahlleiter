package db.in.tum.de.datenbanken.schema.zweitstimme;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "zweitestimme_aggr")
public class ZweitestimmeAggr {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "zweitestimme_aggr_seq")
    @SequenceGenerator(name = "zweitestimme_aggr_seq")
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