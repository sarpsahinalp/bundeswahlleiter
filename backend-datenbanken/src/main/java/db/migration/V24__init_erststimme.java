package db.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.postgresql.copy.CopyIn;
import org.postgresql.copy.CopyManager;
import org.postgresql.jdbc.PgConnection;

import java.sql.*;


public class V24__init_erststimme extends BaseJavaMigration {

    @Override
    public void migrate(Context context) throws SQLException {
        Connection connection = context.getConnection();

        Statement statement = connection.createStatement();
        statement.executeUpdate("ALTER TABLE erststimme DISABLE TRIGGER ALL;");

        String query = """
                SELECT *
                FROM erststimme_aggr
                WHERE wahlkreis_id <= 5;
                """;
        PreparedStatement preparedStatement = connection.prepareStatement(query);
        ResultSet resultSet = preparedStatement.executeQuery();

        PgConnection copyOperationConnection = connection.unwrap(PgConnection.class);
        CopyManager copyManager = new CopyManager(copyOperationConnection);
        CopyIn copyIn = copyManager.copyIn("COPY erststimme FROM STDIN WITH DELIMITER '|'");

        int batchWriteSize = 10000;
        StringBuilder batchBuffer = new StringBuilder();

        while (resultSet.next()) {
            long partei_id = resultSet.getLong("partei_id");
            long wahlkreis_id = resultSet.getLong("wahlkreis_id");
            int jahr = resultSet.getInt("jahr");
            long stimmen = resultSet.getLong("stimmen");

            String vote = String.format("0|%d|%d|%d\n", partei_id, wahlkreis_id, jahr);

            for(int i = 0; i < stimmen; i++) {

                batchBuffer.append(vote);

                if (batchBuffer.length() >= batchWriteSize) {
                    byte[] bytes = batchBuffer.toString().getBytes();
                    copyIn.writeToCopy(bytes, 0, bytes.length);
                    batchBuffer.setLength(0); // Clear the buffer
                }
            }
        }

        if (!batchBuffer.isEmpty()) {
            byte[] bytes = batchBuffer.toString().getBytes();
            copyIn.writeToCopy(bytes, 0, bytes.length);
        }
        copyIn.endCopy();

        statement.executeUpdate("ALTER TABLE erststimme ENABLE TRIGGER ALL;");

    }
}