package db.migration;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

@Component
@RequiredArgsConstructor
public class SeatCalculation {

    private final DataSource dataSource;

    public void refreshSeats() {
        // Calculate the number of seats for each party in each state
        try (Connection connection = dataSource.getConnection();
                PreparedStatement preparedStatement = connection.prepareStatement("SELECT * FROM calculate_seats()")) {
                preparedStatement.execute();
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

}
