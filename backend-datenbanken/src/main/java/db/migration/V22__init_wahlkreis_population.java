package db.migration;

import db.in.tum.de.datenbanken.utils.ParseAndInsertCSV;
import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.SingleConnectionDataSource;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;


public class V22__init_wahlkreis_population extends BaseJavaMigration {

    private static final String[] CSV_FILE_PATH = {
            "backend-datenbanken/src/main/resources/electionData/targetCSV/2017/population_wahlkreis2017.csv",
            "backend-datenbanken/src/main/resources/electionData/targetCSV/2021/population_wahlkreis2021.csv",
    };

    @Override
    public void migrate(Context context) {
        // Define the batch insert SQL with placeholders for the parameters
        String insertSql = """
                INSERT INTO  population_wahlkreis (wahlkreis_id, population, year)
                VALUES (?, ?, ?);
                """;

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
                    preparedStatement.setLong(1, Long.parseLong(row[0].trim())); // wahlkreis
                    preparedStatement.setLong(2, (long) (Double.parseDouble(row[1].trim()) * 1000)); // svb_insgesamt
                    preparedStatement.setInt(3, Integer.parseInt(row[2].trim())); // year

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