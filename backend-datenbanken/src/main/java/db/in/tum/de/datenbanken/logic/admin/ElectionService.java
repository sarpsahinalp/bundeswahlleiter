package db.in.tum.de.datenbanken.logic.admin;

import db.in.tum.de.datenbanken.logic.voting.VoteCodeRepository;
import db.in.tum.de.datenbanken.schema.election.Election;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

@Slf4j
@Service
@RequiredArgsConstructor
public class ElectionService {

    private final ElectionRepository electionRepository;
    private final VoteCodeRepository voteCodeRepository;
    private final DataSource dataSource;
    private final PlatformTransactionManager transactionManager;

    private Lock mutex = new ReentrantLock();

    /**
     * Checks if there is an active election.
     */
    public boolean isElectionActive() {
        return electionRepository.existsByStatus(Election.Status.ACTIVE);
    }

    /**
     * Returns the active election if one exists.
     */
    public Optional<Election> getActiveElection() {
        return electionRepository.findByStatus(Election.Status.ACTIVE);
    }

    /**
     * Starts a new election by setting its status to ACTIVE,
     * provided there isn't already an active election and no election exists for the same year.
     *
     * @param startTime The start time of the election.
     * @throws IllegalStateException if an active election exists or an election for the same year already exists.
     */
    @SuppressWarnings("OptionalGetWithoutIsPresent")
    public void startElection(LocalDateTime startTime, long totalVotes) {
        // Check for active election in a separate transaction
        if (isElectionActive()) {
            throw new IllegalStateException("An active election already exists.");
        }

        int electionYear = startTime.getYear();

        TransactionTemplate transactionTemplate = new TransactionTemplate(transactionManager);
        transactionTemplate.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        transactionTemplate.setIsolationLevel(TransactionDefinition.ISOLATION_SERIALIZABLE);

        Election generated = transactionTemplate.execute(status -> {
            // Lock the election row (if exists) for the year
            if (electionRepository.existsByYear(electionYear)) {
                throw new IllegalStateException("Election for year " + electionYear + " already exists.");
            }

            // Create and save the election
            Election election = new Election();
            election.setStartTime(startTime);
            election.setYear(electionYear);
            election.setStatus(Election.Status.ACTIVE);
            election.setTotalVotes(totalVotes);
            return electionRepository.save(election);
        });

        // Generate vote codes in a separate transaction (non-blocking)
        generateVoteCodesUsingBulkInsert(generated.getId(), totalVotes);
    }

    private void generateVoteCodesUsingBulkInsert(Long electionId, long totalVotes) {
        int chunkSize = 100000; // Adjust based on DB performance
        long remaining = totalVotes;

        String sql = "WITH wk AS (SELECT array_agg(id ORDER BY id) AS ids FROM wahlkreis) " +
                "INSERT INTO vote_code (code, wahlkreis_id, election_id) " +
                "SELECT gen_random_uuid(), " +
                "       wk.ids[(seq - 1) % array_length(wk.ids, 1) + 1], " +
                "       ? " +
                "FROM wk, generate_series(1, ?) seq;";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            conn.setAutoCommit(false);

            conn.prepareStatement("ALTER TABLE vote_code DISABLE TRIGGER ALL;").execute();

            while (remaining > 0) {
                int currentChunk = (int) Math.min(chunkSize, remaining);
                stmt.setLong(1, electionId);
                stmt.setInt(2, currentChunk);
                stmt.executeUpdate();
                conn.commit();
                remaining -= currentChunk;
                log.info(String.valueOf(remaining));
            }

            conn.prepareStatement("ALTER TABLE vote_code ENABLE TRIGGER ALL;").execute();
        } catch (SQLException e) {
            throw new RuntimeException("Bulk insert failed", e);
        }
    }

    /**
     * Stops the currently active election by setting its status to INACTIVE.
     *
     * @throws IllegalStateException if no active election exists.
     */
    @Transactional
    public Election stopElection() {
        Optional<Election> activeElectionOpt = getActiveElection();
        if (activeElectionOpt.isEmpty()) {
            throw new IllegalStateException("No active election to stop.");
        }

        Election activeElection = activeElectionOpt.get();
        activeElection.setStatus(Election.Status.INACTIVE);
        return electionRepository.save(activeElection);
    }

    public long getElectionTotalCount(long electionId) {
        return electionRepository.getElectionTotalCount(electionId);
    }

    public long getCountOfRemainingVotes(long electionId) {
        return electionRepository.getCountOfRemainingVotes(electionId);
    }
}


