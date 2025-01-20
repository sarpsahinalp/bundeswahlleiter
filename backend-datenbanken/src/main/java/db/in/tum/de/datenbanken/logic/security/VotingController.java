package db.in.tum.de.datenbanken.logic.security;

import db.in.tum.de.datenbanken.configuration.security.TokenService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@Slf4j
@RestController
@AllArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class VotingController {

    private final TokenService tokenService;
    private final VoteCodeRepository codeRepo;

    @PostMapping("/validate-hash-and-issue-token")
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public ResponseEntity<String> validateHashAndIssueToken(
            @RequestParam String code,
            HttpServletResponse response) {

        // 1. Lookup the code in the DB
        //    If you store the code in plain text, just do findByCode(code).
        //    If you store a hashed version, you must hash the incoming `code` first and query by that.
        String voterCode = codeRepo.findByCode(code)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invalid code."));

        // 3. Mark code as used to prevent re-issuance

        // 4. Generate short-lived JWT (with random or minimal claim)
        //    Instead of using the user’s original code, generate a new random claim
        //    to avoid storing the user’s code in the token. This helps anonymity.
        String token = tokenService.createTokenForVoting(voterCode);

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
        String voterCode = codeRepo.findByCode(ephemeralClaim)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "You have already voted!"));

        // 3. Record the vote in your DB
        //    Importantly, store it WITHOUT linking to ephemeralClaim or user data
        //    to maintain anonymity. If you must store ephemeralClaim for a time, store
        //    only a hashed/salted version so it can’t be trivially linked back.
//        recordVote(voteData);

        log.info(voteData.toString());

        // Delete from the DB, so the user can't vote again
        codeRepo.deleteByCode(voterCode);

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
