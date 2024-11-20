package db.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

import static db.in.tum.de.datenbanken.utils.ParseAndInsertCSV.readCsv;


public class V7__init_kandidaten_2021 extends BaseJavaMigration {

    private static final String CSV_FILE_PATH = "src/main/resources/electionData/targetCSV/kandidaturen2021.csv";

    @Override
    public void migrate(Context context) {
        // Define the batch insert SQL with placeholders for the parameters
        String insertSql = "INSERT INTO kandidatur (id, nachname, vorname, geburtsjahr, partei_id, wahlkreis_id, bundesland_id, landesliste_platz, jahr) "
                + "VALUES (nextval('kandidatur_seq'), ?, ?, ?, (select partei.id from partei where partei.kurzbezeichnung = ?), ?, (select bundesland.id from bundesland where bundesland.name = ?), ?, ?)";

        // Set up the reader for the CSV file (located in resources/db/migration)

        List<String[]> rows = readCsv(CSV_FILE_PATH);

        try (PreparedStatement preparedStatement = context.getConnection().prepareStatement(insertSql)) {

            // Define batch size
            int batchSize = 1000;
            AtomicInteger count = new AtomicInteger();

            // Read and parse CSV file line-by-line
            rows.forEach(row -> {
                try {
                    preparedStatement.setString(1, row[0].trim()); // nachname
                    preparedStatement.setString(2, row[1].trim()); // vorname
                    preparedStatement.setInt(3, Integer.parseInt(row[2].trim())); // geburtsjahr
                    preparedStatement.setString(4, row[3].trim()); // partei_name

                    if (row[4].isBlank()) {
                        preparedStatement.setNull(5, java.sql.Types.INTEGER); // wahlkreis_id
                    } else {
                        preparedStatement.setLong(5, Long.parseLong(row[4].trim())); // wahlkreis_id
                    }
                    preparedStatement.setString(6, row[6].trim()); // bundesland_name
                    if (row[6].isBlank()) {
                        preparedStatement.setNull(7, java.sql.Types.INTEGER); // landesliste_platz
                    } else {
                        preparedStatement.setLong(7, Long.parseLong(row[5].trim())); // landesliste_platz
                    }
                    preparedStatement.setInt(8, Integer.parseInt(row[7].trim())); // jahr

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