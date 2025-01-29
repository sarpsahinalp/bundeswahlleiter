package db.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.PrintWriter;
import java.sql.*;

public class V51__generate_votes extends BaseJavaMigration {

    @Override
    public void migrate(Context context) throws SQLException, FileNotFoundException {

        int year = 2025;
        Connection connection = context.getConnection();

        erststimme(year, connection);
        zweitstimme(year, connection);
    }

    private static void erststimme(int year, Connection connection) throws SQLException, FileNotFoundException {
        String TARGET_CSV = String.format("backend-datenbanken/src/main/resources/electionData/stimmzettel_generation/erststimmen_%d.csv", year);
        String query = """
            SELECT *
            FROM erststimme_aggr
            WHERE wahlkreis_id <= 1 and jahr = 2021;
        """;
        ResultSet resultSet = connection.createStatement().executeQuery(query);
        generateCSV(resultSet, year, TARGET_CSV);
    }

    private static void zweitstimme(int year, Connection connection) throws SQLException, FileNotFoundException {
        String TARGET_CSV = String.format("backend-datenbanken/src/main/resources/electionData/stimmzettel_generation/zweitstimme_%d.csv", year);
        String query = """
            SELECT *
            FROM zweitestimme_aggr
            WHERE wahlkreis_id <= 1 and jahr = 2021;
        """;
        ResultSet resultSet = connection.createStatement().executeQuery(query);
        generateCSV(resultSet, year, TARGET_CSV);
    }

    private static void generateCSV(ResultSet resultSet, int year, String TARGET_CSV) throws SQLException, FileNotFoundException {


        File csvOutputFile = new File(TARGET_CSV);

        try (PrintWriter pw = new PrintWriter(csvOutputFile)) {
            pw.print("index;partei_id;wahlkreis_id;jahr\n");
            while (resultSet.next()) {
                long partei_id = resultSet.getLong("partei_id");
                long wahlkreis_id = resultSet.getLong("wahlkreis_id");
                long stimmen = resultSet.getLong("stimmen");

                StringBuilder sb = new StringBuilder();
                String vote = String.format("0;%d;%d;%d\n", partei_id, wahlkreis_id, year);

                for (int i = 0; i < stimmen; i++) {
                    sb.append(vote);
                }

                pw.print(sb);
            }
        }
    }
}
