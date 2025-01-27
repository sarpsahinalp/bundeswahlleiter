package db.in.tum.de.datenbanken.logic.voting;

import db.in.tum.de.datenbanken.schema.kreise.Wahlkreis;
import db.in.tum.de.datenbanken.schema.voting.VoteCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VoteCodeRepository extends JpaRepository<VoteCode, String> {


    @Query(
            value = """
                SELECT v.code, v.wahlkreis_id, e.year 
                FROM vote_code v
                join elections e on v.election_id = e.id 
                where v.code = :code and e.status = 'ACTIVE'
                and e.start_time < CURRENT_TIMESTAMP
                """
            , nativeQuery = true
    )
    List<Object[]> findByCode(@Param("code") String code);

    @Modifying
    @Query(
            value = "DELETE FROM vote_code v where v.code = :code"
            , nativeQuery = true
    )
    void deleteByCode(String code);

    @Query(
            value = """
                    SELECT k.vorname, k.nachname, k.wahlkreis_id, p.kurzbezeichnung, p.name, p.id, k.titel, k.beruf, k.wohnort
                    FROM kandidatur k
                    LEFT JOIN partei p ON k.partei_id = p.id
                    WHERE k.wahlkreis_id = :wahlkreisID
                                          AND k.jahr = :year
                    """,
            nativeQuery = true
    )
    List<Object[]> getCandidatesByWahlkreisAndYearErstestimme(long wahlkreisID, int year);

    @Query(
            value = """
                    SELECT k.vorname, k.nachname, k.landesliste_platz, k.bundesland_id, p.kurzbezeichnung, p.name, p.id
                    FROM kandidatur k
                    LEFT JOIN partei p ON k.partei_id = p.id
                    JOIN bundesland b on k.bundesland_id = b.id
                    JOIN wahlkreis w ON b.id = w.bundesland_id
                    WHERE k.jahr = :year
                    AND w.id = :wahlkreid_id
                    AND k.landesliste_platz <= 5
                    ORDER BY k.landesliste_platz;
                    """,
            nativeQuery = true
    )
    List<Object[]> getPartyByBundeslandAndYearZweitestimme(@Param("wahlkreid_id") long wahlkreisId, @Param("year") int year);

    @Modifying
    @Query(
            value = "INSERT INTO erststimme (id, partei_id, wahlkreis_id, jahr) VALUES (nextval('erststimme_seq'), :partei_id, :wahlkreis_id, :jahr)",
            nativeQuery = true
    )
    void saveErstestimme(@Param("wahlkreis_id") long wahlkreis_id, @Param("partei_id") long partei_id, @Param("jahr") int jahr);


    @Modifying
    @Query(
            value = "INSERT INTO zweitestimme (id, partei_id, wahlkreis_id, jahr) VALUES (nextval('zweitestimme_seq'), :partei_id, :wahlkreis_id, :jahr)",
            nativeQuery = true
    )
    void saveZweitestimme(@Param("wahlkreis_id") long wahlkreis_id, @Param("partei_id") long partei_id, @Param("jahr") int jahr);

    @Query(
            value = "SELECT w FROM Wahlkreis w WHERE w.id = :wahlkreis_id"
    )
    Wahlkreis findWahlkreisByWahlkreisId(long wahlkreis_id);
}
