package db.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.postgresql.copy.CopyManager;
import org.postgresql.core.BaseConnection;

import java.sql.Connection;
import java.sql.Statement;
import java.util.logging.Level;
import java.util.logging.Logger;


public class V52__load_bulk_vote_codes extends BaseJavaMigration {

  private static final Logger LOG = Logger.getLogger(V52__load_bulk_vote_codes.class.getName());

  // Change this path to the absolute location of your CSV
  private static final String CSV_PATH = "backend-datenbanken/src/main/resources/electionData/voting/votecodes.csv";

  // If your CSV has a header row, add HEADER. If not, remove "HEADER".
  // Also adapt columns to match your CSV columns exactly.
  private static final String COPY_SQL =
          "COPY vote_code(code, wahlkreis_id, election_id) " +
                  "FROM STDIN WITH (FORMAT csv, DELIMITER ';', HEADER true)";

  @Override
  public void migrate(Context context) throws Exception {
    // We can run everything in a single transaction,
    // or if your CSV is huge, you might choose autoCommit = false or do it outside of a Tx.
    // Just note that Postgres COPY within a Tx might require enough memory/logging for the entire load.
    Connection conn = context.getConnection();

    try (Statement st = conn.createStatement();) {
      conn.setAutoCommit(false);

      // 1. Drop indexes to avoid overhead during COPY
      LOG.info("Dropping primary key constraint pk_vote_code...");
      st.execute("ALTER TABLE vote_code DROP CONSTRAINT pk_vote_code");

      LOG.info("Disabling triggers on vote_code...");
      st.execute("ALTER TABLE vote_code DISABLE TRIGGER ALL");

      // 3. Use the PG-specific CopyManager
      BaseConnection pgConn = conn.unwrap(BaseConnection.class);
      CopyManager copyManager = new CopyManager(pgConn);

      // 4. Perform the COPY
      LOG.info("Starting COPY from CSV: " + CSV_PATH);
      // The file must be accessible to the DB server if you use COPY FROM file.
      // If your DB is remote, consider COPY FROM STDIN + FileReader or use a staging server.
      try (java.io.FileReader fileReader = new java.io.FileReader(CSV_PATH)) {
        long rowsCopied = copyManager.copyIn(COPY_SQL, fileReader);
        LOG.info("Finished COPY. Rows inserted: " + rowsCopied);
      }

      LOG.info("Recreating primary key constraint pk_vote_code...");
      st.execute("ALTER TABLE vote_code ADD CONSTRAINT pk_vote_code PRIMARY KEY (code)");

      // 5. Re-enable triggers
      LOG.info("Re-enabling triggers on vote_code...");
      st.execute("ALTER TABLE vote_code ENABLE TRIGGER ALL");

      conn.commit();
      LOG.info("Migration completed successfully.");

    } catch (Exception e) {
      // If anything fails, rollback
      LOG.log(Level.SEVERE, "Error during bulk load", e);
      throw e; // Flyway will mark the migration as failed
    }
  }
}