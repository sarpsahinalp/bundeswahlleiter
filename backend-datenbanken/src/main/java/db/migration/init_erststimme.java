package db.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.postgresql.copy.CopyManager;
import org.postgresql.core.BaseConnection;

import java.io.BufferedReader;
import java.io.FileReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Connection;
import java.util.List;

public class init_erststimme extends BaseJavaMigration {

    private static final String EXPANDED_FILES_DIRECTORY = "src/main/resources/electionData/targetCSV/erststimmeExpanded"; // Path to expanded files

    public void migrate(Context context) throws Exception {
        // Fetch all CSV files from the directory
        List<Path> csvFiles = Files.list(Paths.get(EXPANDED_FILES_DIRECTORY))
                .filter(path -> path.toString().endsWith(".csv"))
                .toList();

        int batchSize = 10; // Number of files per transaction
        Connection connection = context.getConnection();
        connection.setAutoCommit(false);
        int fileCount = 0;
        for (Path csvFile : csvFiles) {
            try {
                System.out.println("Starting to process file: " + csvFile.getFileName());
                importFile(connection, csvFile);
                fileCount++;

                if (fileCount % batchSize == 0 || fileCount == csvFiles.size()) {
                    connection.commit(); // Commit after processing a batch of files
                    System.out.println("Committed batch of " + batchSize + " files.");
                }
            } catch (Exception e) {
                System.err.println("Error importing file: " + csvFile.getFileName());
                e.printStackTrace();
            }
        }
    }

    private void importFile(Connection connection, Path csvFile) throws Exception {
        CopyManager copyManager = new CopyManager(connection.unwrap(BaseConnection.class));
        try (BufferedReader reader = new BufferedReader(new FileReader(csvFile.toFile()))) {
            copyManager.copyIn("COPY erststimme (partei_id, wahlkreis_id, jahr) FROM STDIN WITH CSV HEADER", reader);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}
