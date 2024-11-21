package db.in.tum.de.datenbanken.utils;

import com.opencsv.CSVParserBuilder;
import com.opencsv.CSVReader;
import com.opencsv.CSVReaderBuilder;
import com.opencsv.exceptions.CsvException;

import java.io.FileReader;
import java.io.IOException;
import java.util.List;

public class ParseAndInsertCSV {


    public static List<String[]> readCsv(String filePath) {
        // TODO: Do good error handling
        try (CSVReader reader = new CSVReaderBuilder(new FileReader(filePath))
                .withSkipLines(1)
                .withCSVParser(new CSVParserBuilder().withSeparator(';').build()).build()
        ) {
            return reader.readAll();
        } catch (IOException | CsvException e) {
            throw new RuntimeException("Error reading CSV file: " + e.getMessage());
        }
    }

}
