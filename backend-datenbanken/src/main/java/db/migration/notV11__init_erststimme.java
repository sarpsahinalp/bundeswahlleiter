package db.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;

import java.sql.PreparedStatement;
import java.sql.SQLException;

public class notV11__init_erststimme extends BaseJavaMigration {

    @Override
    public void migrate(Context context) {
        // Define the batch insert SQL with placeholders for the parameters
        String insertSql = "WITH RECURSIVE STIMMEN (partei_id, wahlkreis_id, jahr, counter) AS (" +
                "    SELECT za.partei_id, za.wahlkreis_id, za.jahr, za.stimmen FROM erststimme_aggr za WHERE za.wahlkreis_id = ?" +
                "    UNION" +
                "    SELECT s.partei_id, s.wahlkreis_id, s.jahr, (s.counter - 1)" +
                "    FROM STIMMEN s" +
                "    WHERE s.counter > 1" +
                ")" +
                "INSERT INTO erststimme(id, partei_id, wahlkreis_id, jahr)" +
                "    (SELECT 1, s.partei_id, s.wahlkreis_id, s.jahr FROM STIMMEN s);";

        try (PreparedStatement preparedStatement = context.getConnection().prepareStatement(insertSql)) {
            for (int i = 1; i < 300; i++) {
                preparedStatement.setInt(1, i);
                preparedStatement.addBatch();
                preparedStatement.executeBatch();
            }

            preparedStatement.executeBatch();
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

}
