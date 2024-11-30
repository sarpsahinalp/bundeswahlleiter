package db.migration;

import db.in.tum.de.datenbanken.utils.ParseAndInsertCSV;
import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

public class V7__init_parteien_EB extends BaseJavaMigration {

    private static final String[] CSV_FILE_PATH = {
            "backend-datenbanken/src/main/resources/electionData/targetCSV/2021/parteien_EB.csv",
    };

    @Override
    public void migrate(Context context) {

        // Define the batch insert SQL with placeholders for the parameters
        String insertSql = "UPDATE partei " +
                "SET name = ? " +
                "WHERE name IS NULL AND (" +
                "        (NOT is_einzelbewerber AND kurzbezeichnung = ?) OR" +
                "        (is_einzelbewerber AND kurzbezeichnung = ? AND wahlkreis_id = CAST(? AS INT)))";

        // Set up the reader for the CSV file (located in resources/db/migration)
        List<String[]> rows = Arrays.stream(CSV_FILE_PATH)
                .map(ParseAndInsertCSV::readCsv)
                .flatMap(List::stream)
                .toList();

        try (PreparedStatement preparedStatement = context.getConnection().prepareStatement(insertSql)) {

            // Define batch size
            int batchSize = 1000;
            AtomicInteger count = new AtomicInteger();

            // Read and parse CSV file line-by-line
            rows.forEach(row -> {
                try {
                    preparedStatement.setString(1, row[2].trim()); // name
                    preparedStatement.setString(2, row[0].trim()); // kurzbezeichnung
                    preparedStatement.setString(3, row[0].trim()); // kurzbezeichnung
                    preparedStatement.setString(4, row[1].trim()); // wahlkreis_id

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
