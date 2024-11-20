package db.in.tum.de.datenbanken.schema.kreise;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BevoelkerungRepository extends JpaRepository<Bevoelkerung, Long> {

    /**
     * Get the total number of allocated seats given a divisor.
     */
    @Query(value = "SELECT SUM(ROUND(b.bevoelkerung / :divisor)) FROM bevoelkerung b WHERE b.jahr = :year", nativeQuery = true)
    Long getTotalAllocatedSeats(@Param("divisor") double divisor, @Param("year") int year);

    /**
     * Get the sum of the population for a given year.
     */
    @Query(value = "SELECT SUM(b.bevoelkerung) FROM bevoelkerung b WHERE b.jahr = :year", nativeQuery = true)
    Long getSumOfPopulationByYear(int year);
}