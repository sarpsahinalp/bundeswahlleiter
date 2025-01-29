package db.in.tum.de.datenbanken.logic.admin;

import db.in.tum.de.datenbanken.configuration.security.TokenService;
import db.in.tum.de.datenbanken.logic.voting.VoteCodeRepository;
import db.in.tum.de.datenbanken.schema.election.Election;
import db.in.tum.de.datenbanken.schema.kreise.Wahlkreis;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.postgresql.copy.CopyManager;
import org.postgresql.jdbc.PgConnection;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.multipart.MultipartFile;

import javax.sql.DataSource;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.io.InputStreamReader;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.io.BufferedReader;


@Slf4j
@Service
@RequiredArgsConstructor
public class ElectionService {

    private final ElectionRepository electionRepository;
    private final VoteCodeRepository voteCodeRepository;
    private final DataSource dataSource;
    private final PlatformTransactionManager transactionManager;
    private static final SecureRandom random = new SecureRandom();

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
        // e.g., how many rows to batch-insert in one go
        int chunkSize = 10000;

        // 1) Query all wahlkreis IDs in order (if you need to round-robin them)
        List<Wahlkreis> wahlkreisIds = electionRepository.findAllWahlkreis();
        int wahlkreisIndex = 0;

        // 2) Prepare the insert statement
        String insertSQL =
                "INSERT INTO vote_code (code, wahlkreis_id, election_id) " +
                        "VALUES (?, ?, ?)";

        String createVoteCount = "INSERT INTO vote_count (total_votes, election_id) VALUES (0, ?)";

        byte[] salt = TokenService.securityProperties.get("BCRYPT_SALT").toString().getBytes();

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(insertSQL);
             PreparedStatement stmtVoteCount = conn.prepareStatement(createVoteCount)) {

            stmtVoteCount.setLong(1, electionId);
            stmtVoteCount.execute();

            conn.setAutoCommit(false);

            long inserted = 0;
            while (inserted < totalVotes) {
                int currentChunk = (int) Math.min(chunkSize, totalVotes - inserted);

                // 3) For each row in this chunk, generate a unique code and add to batch
                for (int i = 0; i < currentChunk; i++) {
                    // Generate a unique code
                    byte[] rawTokenBytes = new byte[16]; // 128-bit token
                    random.nextBytes(rawTokenBytes);

                    String tokenPlaintext = Base64.getUrlEncoder().withoutPadding().encodeToString(rawTokenBytes);

                    MessageDigest sha256 = MessageDigest.getInstance("SHA-256");
                    sha256.update(salt);
                    byte[] hashBytes = sha256.digest(rawTokenBytes);
                    String hashedBase64 = Base64.getEncoder().encodeToString(hashBytes);

                    // Round-robin picking from wahlkreisIds (if needed)
                    long wahlkreisId = wahlkreisIds.get(wahlkreisIndex).getId();
                    wahlkreisIndex = (wahlkreisIndex + 1) % wahlkreisIds.size();

                    // Bind parameters
                    stmt.setString(1, hashedBase64);
                    stmt.setLong(2, wahlkreisId);
                    stmt.setLong(3, electionId);
                    stmt.addBatch();
                }

                // 4) Execute this batch
                stmt.executeBatch();
                conn.commit();  // commit after each chunk (or do one big commit at the end)

                inserted += currentChunk;
                log.info("Inserted so far: {}", inserted);
            }

            conn.commit();
        } catch (SQLException | NoSuchAlgorithmException e) {
            log.error(e.getMessage());
            throw new RuntimeException(e);
        }
    }

    /**
     * Stops the currently active election by setting its status to INACTIVE.
     *
     * @throws IllegalStateException if no active election exists.
     */
    @Transactional
    public Election stopElection() {
        // TODO: Refresh the analysis data for the election on stop
        Optional<Election> activeElectionOpt = getActiveElection();
        if (activeElectionOpt.isEmpty()) {
            throw new IllegalStateException("No active election to stop.");
        }

        Election activeElection = activeElectionOpt.get();
        activeElection.setStatus(Election.Status.INACTIVE);
        return electionRepository.save(activeElection);
    }

    // TODO: A new service to refresh data on import!!!

    public long getElectionTotalCount(long electionId) {
        return electionRepository.getElectionTotalCount(electionId);
    }

    public long getCountOfSubmittedVotes(long electionId) {
        return electionRepository.getCountOfSubmittedVotes(electionId);
    }

    public void uploadErststimme(MultipartFile file_erststimme) {
        String copySQL = "COPY erststimme(id, partei_id, wahlkreis_id, jahr)  FROM STDIN WITH DELIMITER ';' CSV HEADER;";

        loadData(file_erststimme, copySQL);
    }

    public void uploadZweitstimme(MultipartFile file_zweitstimme) {
        String copySQL = "COPY zweitestimme(id, partei_id, wahlkreis_id, jahr)  FROM STDIN WITH DELIMITER ';' CSV HEADER;";

        loadData(file_zweitstimme, copySQL);
    }

    private void loadData(MultipartFile file_erststimme, String copySQL) {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file_erststimme.getInputStream()))) {

            Connection connection = dataSource.getConnection();

            PgConnection pgConnection = connection.unwrap(PgConnection.class);
            CopyManager copyManager = new CopyManager(pgConnection);
            copyManager.copyIn(copySQL, reader);

        } catch (Exception e) {
            throw new RuntimeException("Failed to upload CSV file", e);
        }
    }
}


