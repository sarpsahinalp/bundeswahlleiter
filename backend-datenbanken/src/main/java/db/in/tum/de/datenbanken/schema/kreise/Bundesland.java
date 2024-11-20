package db.in.tum.de.datenbanken.schema.kreise;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "bundesland")
public class Bundesland {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "bundesland_seq")
    @SequenceGenerator(name = "bundesland_seq", allocationSize = 1)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;
}