package db.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

import static db.in.tum.de.datenbanken.utils.ParseAndInsertCSV.readCsv;


public class V11__init_zweitestimme_aggr extends BaseJavaMigration {

    private static final String CSV_FILE_PATH = "src/main/resources/electionData/targetCSV/zweitestimme.csv";

    @Override
    public void migrate(Context context) {
        // Define the batch insert SQL with placeholders for the parameters
        String insertSql = "INSERT INTO zweitestimme_aggr (id, partei_id, wahlkreis_id, jahr, stimmen) " +
                "VALUES (nextval('zweitestimme_aggr_seq'), (select partei.id from partei where partei.kurzbezeichnung = ?), ?, ?, ?)";

        // Set up the reader for the CSV file (located in resources/db/migration)

        List<String[]> rows = readCsv(CSV_FILE_PATH);

        try (PreparedStatement preparedStatement = context.getConnection().prepareStatement(insertSql)) {

            // Define batch size
            int batchSize = 1000;
            AtomicInteger count = new AtomicInteger();

            // partei;wahlkreis_id;jahr;anzahl
            rows.forEach(row -> {
                try {
                    // wahlkreis_id;partei;jahr;anzahl
                    preparedStatement.setString(1, row[0].trim()); // partei.name
                    preparedStatement.setLong(2, Long.parseLong(row[1].trim())); // wahlkreid_id
                    preparedStatement.setLong(3, Integer.parseInt(row[2].trim())); // jahr
                    preparedStatement.setLong(4, Long.parseLong(row[3].trim())); // stimmen

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