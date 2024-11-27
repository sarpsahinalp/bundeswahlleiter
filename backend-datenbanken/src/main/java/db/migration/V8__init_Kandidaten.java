package db.migration;

import db.in.tum.de.datenbanken.utils.ParseAndInsertCSV;
import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

public class V8__init_Kandidaten extends BaseJavaMigration {

    private static final String[] CSV_FILE_PATH = {
            "src/main/resources/electionData/targetCSV/2021/direktmandate.csv",
            "src/main/resources/electionData/targetCSV/2021/landesliste.csv",
            "src/main/resources/electionData/targetCSV/2017/kandidaten.csv",
    };

    @Override
    public void migrate(Context context) {
        // Define the batch insert SQL with placeholders for the parameters
        String insertSql = "WITH neuePartei(name) AS (VALUES (?))," +
                "neuerWahlkreis(id) AS (SELECT CASE WHEN newWK.column1 ~ E'^\\\\d+$'" +
                "    THEN (SELECT w.id FROM wahlkreis w WHERE w.id = cast(newWK.column1 AS int))" +
                "    ELSE (SELECT w.id FROM wahlkreis w WHERE w.name = newWK.column1) END" +
                "    FROM (VALUES (?)) as newWK)," +
                "neuerKandidat(id, nachname, vorname, geburtsjahr, partei_id, wahlkreis_id, bundesland_id, landesliste_platz, jahr) AS (" +
                "             VALUES (" +
                "                     nextval('kandidatur_seq')," +
                "                     ?," +
                "                     ?," +
                "                     ?," +
                "                     (SELECT p.id FROM partei p, neuePartei np, neuerWahlkreis nw WHERE (NOT p.is_einzelbewerber AND p.kurzbezeichnung = np.name) OR " +
                "                   (p.is_einzelbewerber AND p.kurzbezeichnung = np.name AND p.wahlkreis_id = nw.id))," +
                "                     (SELECT nw.id FROM  neuerWahlkreis nw)," +
                "                     (SELECT b.id FROM bundesland b WHERE b.name = ?)," +
                "                     (SELECT CASE WHEN listenPlatz.column1 > 0 THEN listenPlatz.column1 END" +
                "                      FROM (VALUES (?)) as listenPlatz)," +
                "                     ?" +
                "))" +
                "INSERT INTO kandidatur as k (id, nachname, vorname, geburtsjahr, partei_id, wahlkreis_id, bundesland_id, landesliste_platz, jahr)" +
                "SELECT *" +
                "FROM  neuerKandidat " +
                "ON CONFLICT ON CONSTRAINT kandidaturEinmaligProJahr DO UPDATE " +
                "SET wahlkreis_id = CASE WHEN k.wahlkreis_id is not null THEN k.wahlkreis_id ELSE (SELECT p.id FROM wahlkreis p JOIN neuerKandidat n on p.id = n.wahlkreis_id) END," +
                "    bundesland_id = CASE WHEN k.bundesland_id is not null THEN k.bundesland_id ELSE (SELECT b.id FROM bundesland b JOIN neuerKandidat n on b.id = n.bundesland_id) END," +
                "    landesliste_platz =  CASE WHEN k.landesliste_platz is not null THEN k.landesliste_platz ELSE (SELECT n.landesliste_platz FROM neuerKandidat n WHERE n.landesliste_platz is not null) END";

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
                    preparedStatement.setString(1, row[3].trim()); // partei
                    preparedStatement.setString(2, row[4].trim()); // wahlkreis oder wahlkreis_id
                    preparedStatement.setString(3, row[1].trim()); // nachname
                    preparedStatement.setString(4, row[0].trim()); // vorname
                    preparedStatement.setInt(5, Integer.parseInt(row[2].trim())); // geburtsjahr
                    preparedStatement.setString(6, row[5].trim()); // bundesland
                    preparedStatement.setInt(7, Integer.parseInt(row[6].trim())); // landesliste_platz
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
