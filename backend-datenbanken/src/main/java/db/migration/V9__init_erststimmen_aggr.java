package db.migration;

import db.in.tum.de.datenbanken.utils.ParseAndInsertCSV;
import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

public class V9__init_erststimmen_aggr extends BaseJavaMigration {

    private static final String[] CSV_FILE_PATH = {
            "src/main/resources/electionData/targetCSV/2021/erststimmeAggr.csv",
            "src/main/resources/electionData/targetCSV/2017/erststimmeAggr.csv",
    };

    @Override
    public void migrate(Context context) {
        // Define the batch insert SQL with placeholders for the parameters
        String insertSql = "WITH " +
                "newWahlkreis(id) AS ( " +
                "   VALUES (?)" +
                "), " +
                "newPartei(id) AS (" +
                "   SELECT p.id FROM partei p, (VALUES (?)) as np WHERE (NOT p.is_einzelbewerber AND p.kurzbezeichnung = np.column1)" +
                "       OR (p.is_einzelbewerber AND p.kurzbezeichnung = np.column1 AND p.wahlkreis_id = (SELECT nw.id FROM newWahlkreis nw))" +
                ")" +
                "INSERT INTO erststimme_aggr (id, partei_id, wahlkreis_id, jahr, stimmen)" +
                "VALUES (nextval('erststimme_aggr_seq')," +
                "        (SELECT np.id FROM newPartei np)," +
                "        (SELECT nw.id FROM newWahlkreis nw )," +
                "        ?," +
                "        ?" +
                "       )";

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
                    preparedStatement.setLong(1, Long.parseLong(row[1].trim())); // wahlkreis_id
                    preparedStatement.setString(2, row[0].trim()); // kurzbezeichnung
                    preparedStatement.setInt(3, Integer.parseInt(row[2].trim())); // jahr
                    preparedStatement.setInt(4, Integer.parseInt(row[3].trim())); // anzahl


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
