package db.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Statement;

public class V18__init_zweitstimme extends BaseJavaMigration {

    @Override
    public void migrate(Context context) {
        Connection connection = context.getConnection();
        try {
            Statement statement = connection.createStatement();
            statement.executeUpdate("ALTER TABLE zweitestimme DISABLE TRIGGER ALL;");
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }

        // Define the batch insert SQL with placeholders for the parameters
        String insertSql = "WITH RECURSIVE STIMMEN (partei_id, wahlkreis_id, jahr, counter) AS (" +
                "    SELECT za.partei_id, za.wahlkreis_id, za.jahr, za.stimmen FROM zweitestimme_aggr za WHERE za.wahlkreis_id = ?" +
                "    UNION" +
                "    SELECT s.partei_id, s.wahlkreis_id, s.jahr, (s.counter - 1)" +
                "    FROM STIMMEN s" +
                "    WHERE s.counter > 1" +
                ")" +
                "INSERT INTO zweitestimme(id, partei_id, wahlkreis_id, jahr)" +
                "    (SELECT nextval('zweitestimme_seq'), s.partei_id, s.wahlkreis_id, s.jahr FROM STIMMEN s);";

        try (PreparedStatement preparedStatement = context.getConnection().prepareStatement(insertSql)) {
            for (int i = 1; i <= 5; i++) {
                preparedStatement.setInt(1, i);
                preparedStatement.addBatch();
                preparedStatement.executeBatch();
            }

            preparedStatement.executeBatch();
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        try {
            Statement statement = connection.createStatement();
            statement.executeUpdate("ALTER TABLE zweitestimme ENABLE TRIGGER ALL;");
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }
}
