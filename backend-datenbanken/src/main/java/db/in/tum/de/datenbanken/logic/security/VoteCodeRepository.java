package db.in.tum.de.datenbanken.logic.security;

import db.in.tum.de.datenbanken.schema.voting.VoteCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VoteCodeRepository extends JpaRepository<VoteCode, String> {


    @Query(
            value = "SELECT v.code FROM vote_code v where v.code = :code"
            , nativeQuery = true
    )
    Optional<String> findByCode(String code);

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

}
