package db.in.tum.de.datenbanken.logic.voting;

import db.in.tum.de.datenbanken.schema.voting.VoteCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VoteCodeRepository extends JpaRepository<VoteCode, String> {


    @Query(
            value = "SELECT v.code, v.wahlkreis_id, v.last_modified_date FROM vote_code v where v.code = :code"
            , nativeQuery = true
    )
    Optional<Object[]> findByCode(@Param("code") String code);

    @Modifying
    @Query(
            value = "DELETE FROM vote_code v where v.code = :code"
            , nativeQuery = true
    )
    void deleteByCode(String code);

    @Query(
            value = "SELECT v.code FROM vote_code v LIMIT 1"
            , nativeQuery = true
    )
    Optional<String> findFirst();

    @Query(
            value = """
                    SELECT k.vorname, k.nachname, k.wahlkreis_id, p.kurzbezeichnung
                    FROM kandidatur k
                    LEFT JOIN partei p ON k.partei_id = p.id
                    WHERE k.wahlkreis_id = :wahlkreisID
                                          AND k.jahr = :year
                    """,
            nativeQuery = true
    )
    List<Object[]> getCandidatesByWahlkreisAndYearErstestimme(int wahlkreisID, int year);

    @Query(
            value = """
                    SELECT k.vorname, k.nachname, k.landesliste_platz, k.bundesland_id, p.kurzbezeichnung
                    FROM kandidatur k
                    LEFT JOIN partei p ON k.partei_id = p.id
                    JOIN bundesland b on k.bundesland_id = b.id
                    JOIN wahlkreis w ON b.id = w.bundesland_id
                    WHERE k.jahr = :year
                    AND w.id = :wahlkreisId
                    AND k.landesliste_platz <= 5
                    ORDER BY k.landesliste_platz;
                    """,
            nativeQuery = true
    )
    List<Object[]> getPartyByBundeslandAndYearZweitestimme(int wahlkreisId, int year);

}
