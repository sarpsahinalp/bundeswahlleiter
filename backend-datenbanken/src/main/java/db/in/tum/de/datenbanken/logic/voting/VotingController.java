package db.in.tum.de.datenbanken.logic.voting;

import db.in.tum.de.datenbanken.configuration.security.TokenService;
import db.in.tum.de.datenbanken.logic.DTOs.token.VotingToken;
import db.in.tum.de.datenbanken.logic.DTOs.voting.ErstestimmeOptionen;
import db.in.tum.de.datenbanken.logic.DTOs.voting.ZweitestimmeOptionen;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@AllArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class VotingController {

    private final TokenService tokenService;
    private final VotingService votingService;

    public static void main(String[] args) {
        System.out.println(BCrypt.gensalt());
    }

    @PostMapping("/validate-hash-and-issue-token/{code}")
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public ResponseEntity<String> validateHashAndIssueToken(
            @PathVariable String code,
            HttpServletResponse response) {

        String hashed = BCrypt.hashpw(code, TokenService.securityProperties.get("BCRYPT_SALT").toString());

        // 1. Lookup the code in the DB
        //    If you store the code in plain text, just do findByCode(code).
        //    If you store a hashed version, you must hash the incoming `code` first and query by that.
        VotingToken votingToken = votingService.validateCode(hashed);

        // 3. Mark code as used to prevent re-issuance

        // 4. Generate short-lived JWT (with random or minimal claim)
        //    Instead of using the user’s original code, generate a new random claim
        //    to avoid storing the user’s code in the token. This helps anonymity.
        String token = tokenService.createTokenForVoting(code, votingToken.wahlkreis_id(), votingToken.last_modified_date());

        // 5. Create secure cookie
        Cookie cookie = new Cookie("vote_jwt", token);
        cookie.setHttpOnly(true);
        // Local environment, so no need for HTTPS
        cookie.setSecure(false);
        cookie.setPath("/");
        // (Optional) cookie.setMaxAge(...);
        // Mitigate CSRF attacks
        cookie.setAttribute("SameSite", "Strict");

        response.addCookie(cookie);

        // 6. Return success or some minimal body
        return ResponseEntity.ok("Voting token issued. Proceed to /secure/vote");
    }

    @GetMapping("/secure/vote/erstestimme")
    public ResponseEntity<List<ErstestimmeOptionen>> getErstestimmeForWahlkreis() {
        // Retrieve the wahlkreisId and year from the JWT
        int wahlkreisId = 1;
        int year = 2025;
        return ResponseEntity.ok(votingService.getErststimmeOptionen(wahlkreisId, year));
    }

    @GetMapping("/secure/vote/zweitestimme")
    public ResponseEntity<List<ZweitestimmeOptionen>> getZweitestimmeForWahlkreis() {
        // Retrieve the wahlkreisId and year from the JWT
        int wahlkreisId = 1;
        int year = 2025;
        return ResponseEntity.ok(votingService.getZweitestimmeOptionen(wahlkreisId, year));
    }

    @PostMapping("/secure/vote")
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public ResponseEntity<String> castVote(@RequestBody Object voteData, HttpServletResponse response) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }

        String ephemeralClaim = (String) auth.getPrincipal();

        log.info("Received vote from: {}", ephemeralClaim);

        // 2. Check if this ephemeral JWT was already used to vote
        //    If your design is purely stateless, you might just rely on token expiration.
        //    Or you can keep a small in-memory or DB record of ephemeral tokens that have
        //    cast a vote, to ensure “single vote.” For example:
//        if (hasAlreadyVoted(ephemeralClaim)) {
//            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You have already voted!");
//        }
        VotingToken votingToken = votingService.validateCode(ephemeralClaim);

        // 3. Record the vote in your DB
        //    Importantly, store it WITHOUT linking to ephemeralClaim or user data
        //    to maintain anonymity. If you must store ephemeralClaim for a time, store
        //    only a hashed/salted version so it can’t be trivially linked back.
//        recordVote(voteData);

        log.info(voteData.toString());

        // Delete from the DB, so the user can't vote again
        votingService.deleteCode(votingToken.code());

        Cookie cookie = new Cookie("vote_jwt", "");
        cookie.setHttpOnly(true);
        // Local environment, so no need for HTTPS
        cookie.setSecure(false);
        cookie.setPath("/");
        // Mitigate CSRF attacks
        cookie.setAttribute("SameSite", "Strict");
        // Expire the cookie
        cookie.setMaxAge(0);

        response.addCookie(cookie);

        return ResponseEntity.ok("Vote cast successfully!");
    }
}
