package db.migration;

import db.in.tum.de.datenbanken.configuration.security.TokenService;
import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;

import java.io.FileWriter;
import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.sql.*;
import java.util.Base64;


public class V50__init_vote_codes extends BaseJavaMigration {

    private static final SecureRandom random = new SecureRandom();
    // Update these according to your environment
    private static final String DB_URL = "jdbc:postgresql://localhost:5432/wahlanalyse";
    private static final String DB_USER = "user";
    private static final String DB_PASSWORD = "1234";
    // CSV file output name
    private static final String CSV_FILE_NAME = "votecodes.csv";
    private static final String CSV_VOTING_TOKENS = "voting_tokens.csv";

    /**
     * Main method to generate vote codes and write them to a CSV file
     */
    public static void main(String[] args) {
        // 1. Query wahlberechtigte data
        // 2. For each wahlkreis, generate the required number of VoteCodes
        // 3. Write them to a CSV file

        // SQL to read wahlberechtigte counts per wahlkreis
        // If you only need "jahr = 2021" or "jahr = 2023", add a WHERE clause
        // E.g.: SELECT wahlkreis_id, wahlberechtigte FROM wahlberechtigte WHERE jahr=2021
        String query = """
                    SELECT wahlkreis_id, wahlberechtigte
                    FROM wahlberechtigte
                    where jahr = 2021
                """;

        // We will just write: code, wahlkreis_id, election_id
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD);
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(query);
             FileWriter csvWriter = new FileWriter(CSV_FILE_NAME);
             FileWriter tokensWriter = new FileWriter(CSV_VOTING_TOKENS)) {

            String salt = TokenService.securityProperties.get("BCRYPT_SALT").toString();

            byte[] saltBytes = salt.getBytes();

            // Write header in CSV
            csvWriter.write("code;wahlkreis_id;election_id\n");
            tokensWriter.write("rawToken;wahlkreis_id;election_id\n");

            while (rs.next()) {
                long wahlkreisId = rs.getLong("wahlkreis_id");
                int wahlberechtigte = rs.getInt("wahlberechtigte");

                // Generate that many codes for this wahlkreis
                for (int i = 0; i < 10; i++) {
                    long electionId = 3L; // hard-coded election ID

                    byte[] rawTokenBytes = new byte[16]; // 128-bit token
                    random.nextBytes(rawTokenBytes);

                    String tokenPlaintext = Base64.getUrlEncoder().withoutPadding().encodeToString(rawTokenBytes);

                    MessageDigest sha256 = MessageDigest.getInstance("SHA-256");
                    sha256.update(saltBytes);
                    byte[] hashBytes = sha256.digest(rawTokenBytes);
                    String hashedBase64 = Base64.getEncoder().encodeToString(hashBytes);

                    csvWriter.write(String.format("%s;%d;%d\n", hashedBase64, wahlkreisId, electionId));
                    tokensWriter.write(String.format("%s;%d;%d\n", tokenPlaintext, wahlkreisId, electionId));
                }
            }

            System.out.println("Vote codes generated and written to " + CSV_FILE_NAME);

        } catch (SQLException | NoSuchAlgorithmException e) {
            e.printStackTrace();
            System.err.println("Database error: " + e.getMessage());
        } catch (IOException e) {
            e.printStackTrace();
            System.err.println("File writing error: " + e.getMessage());
        }
    }

    @Override
    public void migrate(Context context) throws Exception {
        Connection connection = context.getConnection();

        // Disable triggers
        executeSQL(connection, "ALTER TABLE vote_code DISABLE TRIGGER ALL;");

        // Insert 20 million UUIDs in batches
        final long maxRecords = 300; // Total records to insert
        final int batchSize = 100;      // Batch size for each insert

        String createElection2017 = "INSERT INTO elections (id, start_time, year, status, total_votes) VALUES (1, '2017-09-26 08:00:00', 2017, 'INACTIVE', 61688485);";
        String createElection2021 = "INSERT INTO elections (id, start_time, year, status, total_votes) VALUES (2, '2021-09-26 08:00:00', 2021, 'INACTIVE', 61172771);";
        String createElection = "INSERT INTO elections (id, start_time, year, status, total_votes) VALUES (3, '2022-09-26 08:00:00', 2022, 'ACTIVE', 2990);";
        executeSQL(connection, createElection2017 + createElection2021 + createElection);
    }

    private void executeSQL(Connection connection, String sql) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.execute();
        }
    }
}