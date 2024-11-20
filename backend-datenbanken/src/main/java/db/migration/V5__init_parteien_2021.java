package db.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;

import static db.in.tum.de.datenbanken.utils.ParseAndInsertCSV.readCsv;


public class V5__init_parteien_2021 extends BaseJavaMigration {

    private static final String CSV_FILE_PATH = "src/main/resources/electionData/sourceCSV/2021/parties2021.csv";

    @Override
    public void migrate(Context context) {
        // Define the batch insert SQL for the partei table
        String insertParteiSql = "INSERT INTO partei (id, kurzbezeichnung, name, Zusatzbezeichnung, is_einzelbewerber) " +
                "VALUES (nextval('partei_seq'), ?, ?, ?, ?) " +
                "ON CONFLICT (kurzbezeichnung) DO NOTHING";

// Define the batch insert SQL for the Wahlteilnahme table
        String insertWahlteilnahmeSql = "INSERT INTO partei_wahl_teilnahme (id, partei_id, jahr) " +
                "VALUES (nextval('partei_wahl_teilnahme_seq'), ?, ?)";

// Read CSV data
        List<String[]> rows = readCsv(CSV_FILE_PATH);

        try (PreparedStatement insertParteiStmt = context.getConnection().prepareStatement(insertParteiSql, Statement.RETURN_GENERATED_KEYS);
             PreparedStatement insertWahlteilnahmeStmt = context.getConnection().prepareStatement(insertWahlteilnahmeSql)) {

            // Fetch existing kurzbezeichnung to avoid duplicates
            Set<String> existingKurzbezeichnung = new HashSet<>();
            try (Statement stmt = context.getConnection().createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT kurzbezeichnung FROM partei")) {
                while (rs.next()) {
                    existingKurzbezeichnung.add(rs.getString("kurzbezeichnung").trim());
                }
            }

            // Define batch size
            int batchSize = 1000;
            AtomicInteger count = new AtomicInteger();

            rows.stream()
                    .filter(row -> !existingKurzbezeichnung.contains(row[1].trim())) // Filter out duplicates
                    .forEach(row -> {
                        try {
                            // Insert into partei table
                            insertParteiStmt.setString(1, row[1].trim()); // kurzbezeichnung
                            insertParteiStmt.setString(2, row[2].trim()); // name
                            insertParteiStmt.setString(3, row[3].trim()); // Zusatzbezeichnung
                            insertParteiStmt.setBoolean(4, Boolean.parseBoolean(row[4].trim())); // isEinzelbewerber
                            insertParteiStmt.addBatch();

                            // Execute batch for partei
                            if (count.incrementAndGet() % batchSize == 0) {
                                insertParteiStmt.executeBatch();
                            }

                            // Get the generated keys for the newly inserted rows
                            insertParteiStmt.executeBatch(); // Ensure all batched statements are executed
                            try (ResultSet generatedKeys = insertParteiStmt.getGeneratedKeys()) {
                                while (generatedKeys.next()) {
                                    int newParteiId = generatedKeys.getInt(1);

                                    // Insert into Wahlteilnahme table
                                    insertWahlteilnahmeStmt.setInt(1, newParteiId);
                                    insertWahlteilnahmeStmt.setInt(2, 2021); // Year
                                    insertWahlteilnahmeStmt.addBatch();

                                    if (count.get() % batchSize == 0) {
                                        insertWahlteilnahmeStmt.executeBatch();
                                    }
                                }
                            }
                        } catch (SQLException e) {
                            throw new RuntimeException(e);
                        }
                    });

            // Execute remaining batches
            insertParteiStmt.executeBatch();
            insertWahlteilnahmeStmt.executeBatch();

        } catch (SQLException e) {
            throw new RuntimeException(e);
        }


    }
}