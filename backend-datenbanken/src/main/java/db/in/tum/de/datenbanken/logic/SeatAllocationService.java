package db.in.tum.de.datenbanken.logic;

import db.in.tum.de.datenbanken.schema.kreise.BevoelkerungRepository;
import lombok.AllArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class SeatAllocationService {

    private static final int TOTAL_SEATS = 598;

    private final BevoelkerungRepository bevoelkerungRepository;

    @Cacheable("divisor")
    public double calculateDivisorForBundesland(int year) {
        System.out.println("Calculating seat allocation for Bundesländer");
        double lowerBound = (double) bevoelkerungRepository.getSumOfPopulationByYear(year) / TOTAL_SEATS - 50000;
        double upperBound = (double) bevoelkerungRepository.getSumOfPopulationByYear(year) / TOTAL_SEATS + 50000;
        double epsilon = 1e-6;
        double divisor = 0.0;

        // Binary search to find the correct divisor
        while (upperBound - lowerBound > epsilon) {
            double midDivisor = (lowerBound + upperBound) / 2.0;

            // Query the total allocated seats for the current divisor
            Long allocatedSeats = bevoelkerungRepository.getTotalAllocatedSeats(midDivisor, year);

            if (allocatedSeats > TOTAL_SEATS) {
                lowerBound = midDivisor; // Increase divisor to reduce seats
            } else if (allocatedSeats < TOTAL_SEATS) {
                upperBound = midDivisor; // Decrease divisor to increase seats
            } else {
                divisor = midDivisor;
                break; // Exact match
            }
        }

        return divisor;
    }

    @Cacheable("party-bundesland")
    public double calculateDivisorForBundeslandiProParty(String bundesland, int totalSeats, int year) {
        return 0.0;
    }
}
