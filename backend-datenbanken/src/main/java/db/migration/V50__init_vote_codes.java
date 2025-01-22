package db.migration;

import db.in.tum.de.datenbanken.configuration.security.TokenService;
import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.security.crypto.bcrypt.BCrypt;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.UUID;


public class V50__init_vote_codes extends BaseJavaMigration {

    @Override
    public void migrate(Context context) throws Exception {
        Connection connection = context.getConnection();

        // Disable triggers
        executeSQL(connection, "ALTER TABLE vote_code DISABLE TRIGGER ALL;");

        // Insert 20 million UUIDs in batches
        final long maxRecords = 300; // Total records to insert
        final int batchSize = 100;      // Batch size for each insert

        String insertSQL = "INSERT INTO vote_code (code, wahlkreis_id, last_modified_date) VALUES (?, ?, NOW());";
        String salt = TokenService.securityProperties.get("BCRYPT_SALT").toString();

        long counter = 0;
        try (PreparedStatement statement = connection.prepareStatement(insertSQL)) {
            for (long i = 0; i < maxRecords; i++) {
                String cur = UUID.randomUUID().toString();
                Files.write(Paths.get("voting_tokens.txt"), (cur + " " + (i % 299 + 1) + System.lineSeparator()).getBytes(), StandardOpenOption.APPEND);
                statement.setString(1, BCrypt.hashpw(cur, salt));
                statement.setInt(2, (int) (i % 299 + 1));

                statement.addBatch();

                if (i % batchSize == 0) {
                    statement.executeBatch();
                    System.out.printf("Inserted %d records...%n", counter);
                }

                counter++;
            }

            // Execute the remaining batch
            statement.executeBatch();
            System.out.printf("Inserted %d records in total.%n", counter);
        }

        // Enable triggers
        executeSQL(connection, "ALTER TABLE vote_code ENABLE TRIGGER ALL;");
    }

    private void executeSQL(Connection connection, String sql) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.execute();
        }
    }
}