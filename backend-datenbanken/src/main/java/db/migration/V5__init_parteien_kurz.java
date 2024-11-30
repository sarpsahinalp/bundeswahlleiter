package db.migration;

import db.in.tum.de.datenbanken.utils.ParseAndInsertCSV;
import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

public class V5__init_parteien_kurz extends BaseJavaMigration {

    private static final String[] CSV_FILE_PATH = {
            "backend-datenbanken/src/main/resources/electionData/targetCSV/2017/parteien.csv",
            "backend-datenbanken/src/main/resources/electionData/targetCSV/2021/parteien.csv",
    };

    @Override
    public void migrate(Context context) {
        // Define the batch insert SQL with placeholders for the parameters
        String insertSql = "INSERT INTO partei(id, kurzbezeichnung, name, zusatzbezeichnung,is_einzelbewerber, wahlkreis_id)" +
                "SELECT *" +
                "FROM (VALUES (nextval('partei_seq'), ?, null, null, ?,(" +
                "    SELECT CASE WHEN wahlkreis_id.column1 > 0 THEN wahlkreis_id.column1 END " +
                "    FROM (VALUES (?)) as wahlkreis_id" +
                "))) as p1 " +
                "WHERE NOT EXISTS(" +
                "    SELECT * FROM partei p2 WHERE (NOT p2.is_einzelbewerber AND p2.kurzbezeichnung = p1.column2) OR " +
                "   (p2.is_einzelbewerber AND p2.kurzbezeichnung = p1.column2 AND p2.wahlkreis_id = p1.column6)" +
                ");";

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
                    preparedStatement.setString(1, row[0].trim()); // kurzbezeichnung
                    preparedStatement.setBoolean(2, Boolean.parseBoolean(row[2].trim())); // is_einzelbewerber
                    preparedStatement.setInt(3, Integer.parseInt(row[1].trim())); // wahlkreis_id


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
