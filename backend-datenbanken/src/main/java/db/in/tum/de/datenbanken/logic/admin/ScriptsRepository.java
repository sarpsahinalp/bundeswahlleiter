package db.in.tum.de.datenbanken.logic.admin;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Repository;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;

@Repository
public class ScriptsRepository {

    private final static String AGGREGATE_VOTES_SKRIPT = "scripts/aggregateVotes.sql";
    private final static String AGGREGATE_CALC_SITZVERTEILUNG = "test.migration/refreshSitzverteilungForYear.sql";

    @PersistenceContext
    private EntityManager entityManager;

    public void updateSitzverteilung(int year) throws IOException {
        executeScript(year, AGGREGATE_VOTES_SKRIPT);
        executeScript(year, AGGREGATE_CALC_SITZVERTEILUNG);
    }

    private void executeScript(int year, String skript) throws IOException {
        // Read SQL file
        String sql = Files.readString(new ClassPathResource(skript).getFile().toPath(), StandardCharsets.UTF_8);

        // Execute SQL query
        entityManager.createNativeQuery(sql)
                .setParameter("year", year)
                .executeUpdate();
    }

    public void updateVoteCount(int year){
        String sql = """
                UPDATE vote_count
                SET total_votes = (SELECT count(*) FROM erststimme WHERE jahr = :year)
                WHERE election_id = (SELECT id FROM elections WHERE year = :year);
            """;

        entityManager.createNativeQuery(sql)
                .setParameter("year", year)
                .executeUpdate();
    }

}
