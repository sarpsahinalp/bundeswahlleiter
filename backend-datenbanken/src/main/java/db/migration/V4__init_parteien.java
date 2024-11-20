package db.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

import static db.in.tum.de.datenbanken.utils.ParseAndInsertCSV.readCsv;

public class V4__init_parteien extends BaseJavaMigration {

    private static final String CSV_FILE_PATH = "src/main/resources/electionData/targetCSV/parteien.csv";

    @Override
    public void migrate(Context context) {

        // Define the batch insert SQL with placeholders for the parameters
        String insertSql = "INSERT INTO partei (id, kurzbezeichnung, name, Zusatzbezeichnung, is_einzelbewerber) " +
                "VALUES (nextval('partei_seq'), ?, ?, ?, ?)";

        // Set up the reader for the CSV file (located in resources/db/migration)

        List<String[]> rows = readCsv(CSV_FILE_PATH);

        try (PreparedStatement preparedStatement = context.getConnection().prepareStatement(insertSql)) {

            // Define batch size
            int batchSize = 1000;
            AtomicInteger count = new AtomicInteger();

            // Read and parse CSV file line-by-line
            rows.forEach(row -> {
                try {
                    preparedStatement.setString(1, row[1].trim()); // kurzbezeichnung
                    preparedStatement.setString(2, row[2].trim()); // name
                    preparedStatement.setString(3, row[3].trim()); // Zusatzbezeichnung
                    preparedStatement.setBoolean(4, Boolean.parseBoolean(row[4].trim())); // isEinzelbewerber

                    // Add this set of parameters to the batch
                    preparedStatement.addBatch();
                    count.getAndIncrement();

                    // Execute batch if batch size is reached
                    if (count.get() % batchSize == 0) {
                        preparedStatement.executeBatch();
                    }
                } catch (SQLException e) {
                    throw new RuntimeException(e);
                }
            });

            preparedStatement.executeBatch();
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }
}
