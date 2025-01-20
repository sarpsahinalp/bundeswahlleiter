package db.in.tum.de.datenbanken.configuration.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String SECRET = "change-me"; // same as used in TokenService
    private static final Algorithm ALGORITHM = Algorithm.HMAC256(SECRET);
    private static final String COOKIE_NAME = "vote_jwt";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String token = extractTokenFromCookie(request);

        if (token != null) {
            try {
                JWTVerifier verifier = JWT.require(ALGORITHM).build();
                DecodedJWT decodedJWT = verifier.verify(token);

                // If verification succeeds, you can read claims:
                String hash = decodedJWT.getClaim("hash").asString();

                // Build an anonymous Authentication (no roles). The principal is the 'hash'.
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(hash, null, null);

                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (JWTVerificationException ex) {
                // Token is invalid or expired
                SecurityContextHolder.clearContext();
            }
        }

        // Continue filter chain
        filterChain.doFilter(request, response);
    }

    private String extractTokenFromCookie(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return null;
        }
        for (Cookie cookie : request.getCookies()) {
            if (COOKIE_NAME.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
