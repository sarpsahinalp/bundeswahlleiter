package db.in.tum.de.datenbanken.logic.admin;

import db.in.tum.de.datenbanken.schema.election.Election;
import db.in.tum.de.datenbanken.schema.kreise.Wahlkreis;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ElectionRepository extends JpaRepository<Election, Long> {

    /**
     * Finds an election by its status.
     */
    Optional<Election> findByStatus(Election.Status status);

    /**
     * Checks if an election with the given status exists.
     */
    boolean existsByStatus(Election.Status status);

    /**
     * Finds an election by its year.
     */
    Optional<Election> findByYear(Integer year);

    /**
     * Checks if an election exists for a given year.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    boolean existsByYear(Integer year);

    @Query(
            value = "SELECT total_votes FROM elections WHERE id = :electionId"
            , nativeQuery = true
    )
    Long getElectionTotalCount(long electionId);

    @Query(
            value = "SELECT COUNT(*) FROM vote_code WHERE election_id = :electionId"
            , nativeQuery = true
    )
    Long getCountOfRemainingVotes(long electionId);

    @Query(
            "SELECT w FROM Wahlkreis w"
    )
    List<Wahlkreis> findAllWahlkreis();
}
