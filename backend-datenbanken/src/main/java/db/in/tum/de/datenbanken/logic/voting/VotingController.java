package db.in.tum.de.datenbanken.logic.voting;

import db.in.tum.de.datenbanken.configuration.security.TokenService;
import db.in.tum.de.datenbanken.configuration.security.dtos.JwtPrincipal;
import db.in.tum.de.datenbanken.logic.DTOs.WahlkreiseDTO;
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

import java.util.LinkedHashMap;
import java.util.List;

@Slf4j
@RestController
@AllArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
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

//        String hashed = BCrypt.hashpw(code, TokenService.securityProperties.get("BCRYPT_SALT").toString());

        // 1. Lookup the code in the DB
        //    If you store the code in plain text, just do findByCode(code).
        //    If you store a hashed version, you must hash the incoming `code` first and query by that.
        VotingToken votingToken = votingService.validateCode(
                code
        );

        // 3. Mark code as used to prevent re-issuance

        // 4. Generate short-lived JWT (with random or minimal claim)
        //    Instead of using the user’s original code, generate a new random claim
        //    to avoid storing the user’s code in the token. This helps anonymity.
        String token = tokenService.createTokenForVoting(code, votingToken.wahlkreis_id(), votingToken.year());

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
    public ResponseEntity<List<ErstestimmeOptionen>> getErstestimmeForWahlkreis(HttpServletResponse response) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        JwtPrincipal principal = (JwtPrincipal) auth.getPrincipal();
        return ResponseEntity.ok(votingService.getErststimmeOptionen(principal.wahlkreis_id(), principal.year() - 4));
    }

    @GetMapping("/secure/vote/zweitestimme")
    public ResponseEntity<List<ZweitestimmeOptionen>> getZweitestimmeForWahlkreis(HttpServletResponse response) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        JwtPrincipal principal = (JwtPrincipal) auth.getPrincipal();
        return ResponseEntity.ok(votingService.getZweitestimmeOptionen(principal.wahlkreis_id(), principal.year() - 4));
    }

    @SuppressWarnings("unchecked")
    @PostMapping("/secure/submit/vote")
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public ResponseEntity<String> castVote(
            @RequestBody Object voteData,
            HttpServletResponse response) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }

        JwtPrincipal ephemeralClaim = (JwtPrincipal) auth.getPrincipal();

        // Check whether the user has already voted
//        String hashed = BCrypt.hashpw(ephemeralClaim.code(), TokenService.securityProperties.get("BCRYPT_SALT").toString());
        VotingToken votingToken = votingService.validateCode(ephemeralClaim.code());

        LinkedHashMap<String, Integer> vote = (LinkedHashMap<String, Integer>) voteData;
        votingService.saveErsteUndZweiteStimme(vote.get("erststimme").longValue(), vote.get("zweitstimme").longValue(), ephemeralClaim.wahlkreis_id(), ephemeralClaim.year());

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

    @GetMapping("/secure/validate-token")
    public ResponseEntity<WahlkreiseDTO> validateToken(HttpServletResponse response) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        JwtPrincipal ephemeralClaim = (JwtPrincipal) auth.getPrincipal();
        return ResponseEntity.ok(new WahlkreiseDTO(votingService.getWahlkreisById(ephemeralClaim.wahlkreis_id())));
    }

}
