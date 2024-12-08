package db.migration;

import db.in.tum.de.datenbanken.utils.ParseAndInsertCSV;
import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.SingleConnectionDataSource;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;


public class V20__init_wahlkreis_info extends BaseJavaMigration {

    private static final String[] CSV_FILE_PATH = {
            "backend-datenbanken/src/main/resources/electionData/targetCSV/2017/alter_beschaftigung_arbeitslosigkeit2017.csv",
            "backend-datenbanken/src/main/resources/electionData/targetCSV/2021/alter_beschaftigung_arbeitslosigkeit2021.csv",
    };

    @Override
    public void migrate(Context context) {
        // Define the batch insert SQL with placeholders for the parameters
        String insertSql = """
                INSERT INTO  wahlkreis_soziokulturell_info(wahlkreis_id, svb_insgesamt, svb_landw_fischerei, svb_produz_gewerbe, 
                                                       svb_handel_gast_verkehr, svb_dienstleister, svb_uebrige_dienstleister, 
                                                       alter_unter_18, alter_18_24, alter_25_34, alter_35_59, 
                                                       alter_60_74, alter_75_plus, alq_frauen, 
                                                       alq_15_24, alq_55_64, alq_insgesamt, alq_maenner, year) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                """;

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
                    preparedStatement.setLong(1, Long.parseLong(row[0].trim())); // wahlkreis
                    preparedStatement.setDouble(2, Double.parseDouble(row[1].trim())); // svb_insgesamt
                    preparedStatement.setDouble(3, Double.parseDouble(row[2].trim())); // svb_landw_fischerei
                    preparedStatement.setDouble(4, Double.parseDouble(row[3].trim())); // svb_produz_gewerbe
                    preparedStatement.setDouble(5, Double.parseDouble(row[4].trim())); // svb_handel_gast_verkehr
                    preparedStatement.setDouble(6, Double.parseDouble(row[5].trim())); // svb_dienstleister
                    preparedStatement.setDouble(7, Double.parseDouble(row[6].trim())); // svb_uebrige_dienstleister
                    preparedStatement.setDouble(8, Double.parseDouble(row[7].trim())); // alter_unter_18
                    preparedStatement.setDouble(9, Double.parseDouble(row[8].trim())); // alter_18_24
                    preparedStatement.setDouble(10, Double.parseDouble(row[9].trim())); // alter_25_34
                    preparedStatement.setDouble(11, Double.parseDouble(row[10].trim())); // alter_35_59
                    preparedStatement.setDouble(12, Double.parseDouble(row[11].trim())); // alter_60_74
                    preparedStatement.setDouble(13, Double.parseDouble(row[12].trim())); // alter_75_plus
                    preparedStatement.setDouble(14, Double.parseDouble(row[13].trim())); // alq_frauen
                    preparedStatement.setDouble(15, Double.parseDouble(row[14].trim())); // alq_15_24
                    preparedStatement.setDouble(16, Double.parseDouble(row[15].trim())); // alq_55_64
                    preparedStatement.setDouble(17, Double.parseDouble(row[16].trim())); // alq_insgesamt
                    preparedStatement.setDouble(18, Double.parseDouble(row[17].trim())); // alq_maenner
                    preparedStatement.setInt(19, Integer.parseInt(row[18].trim())); // year

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