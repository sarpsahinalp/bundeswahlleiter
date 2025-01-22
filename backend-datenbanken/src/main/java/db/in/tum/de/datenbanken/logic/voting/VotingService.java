package db.in.tum.de.datenbanken.logic.voting;

import db.in.tum.de.datenbanken.logic.DTOs.token.VotingToken;
import db.in.tum.de.datenbanken.logic.DTOs.voting.ErstestimmeOptionen;
import db.in.tum.de.datenbanken.logic.DTOs.voting.ZweitestimmeOptionen;
import db.in.tum.de.datenbanken.schema.voting.VoteCode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VotingService {

    private final VoteCodeRepository voteRepo;
    private final JdbcTemplate jdbcTemplate;

    @Transactional(readOnly = true)
    public List<ErstestimmeOptionen> getErststimmeOptionen(int wahlkreisId, int year){
        return voteRepo.getCandidatesByWahlkreisAndYearErstestimme(wahlkreisId, year)
                .stream().map(ErstestimmeOptionen::new).toList();
    }

    @Transactional(readOnly = true)
    public List<ZweitestimmeOptionen> getZweitestimmeOptionen(int wahlkreisId, int year){
        return voteRepo.getPartyByBundeslandAndYearZweitestimme(wahlkreisId, year)
                .stream().map(ZweitestimmeOptionen::new).toList();
    }

    @Transactional(readOnly = true)
    public VotingToken validateCode(String code){
        return voteRepo.findByCode(code)
                .stream()
                .map(VotingToken::new)
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Code not found"));
    }

    @Transactional
    public void deleteCode(String code){
        voteRepo.deleteByCode(code);
    }

    /**
     * Generates 300 voting tokens and writes them to a file.
     */
    public void generateVotingTokens() {
        // Disable triggers
        disableTriggers();

        // Insert 20 million UUIDs in batches
        final long maxRecords = 300; // Total records to insert
        final int batchSize = 100;   // Batch size for each insert

        String insertSQL = "INSERT INTO vote_code (code, wahlkreis_id, last_modified_date) VALUES (?, ?, NOW())";
        long counter = 0;

        try {
            for (long i = 0; i < maxRecords; i++) {
                String cur = UUID.randomUUID().toString();
                writeToFile(cur + " " + (i % 299 + 1) + System.lineSeparator());

                String hashedCode = BCrypt.hashpw(cur, BCrypt.gensalt(12));
                int wahlkreisId = (int) (i % 299 + 1);

                // Execute the batch
                jdbcTemplate.update(insertSQL, hashedCode, wahlkreisId);

                counter++;

                if (i % batchSize == 0) {
                    System.out.printf("Inserted %d records...%n", counter);
                }
            }

            System.out.printf("Inserted %d records in total.%n", counter);
        } catch (Exception e) {
            System.err.println("An error occurred during token generation: " + e.getMessage());
            e.printStackTrace();
        } finally {
            // Enable triggers
            enableTriggers();
        }
    }

    private void disableTriggers() {
        String sql = "ALTER TABLE vote_code DISABLE TRIGGER ALL";
        jdbcTemplate.execute(sql);
    }

    private void enableTriggers() {
        String sql = "ALTER TABLE vote_code ENABLE TRIGGER ALL";
        jdbcTemplate.execute(sql);
    }

    private void writeToFile(String content) throws IOException {
        Files.write(Paths.get("voting_tokens.txt"), content.getBytes(), StandardOpenOption.APPEND);
    }
}
