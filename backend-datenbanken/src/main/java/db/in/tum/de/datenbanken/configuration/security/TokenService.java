package db.in.tum.de.datenbanken.configuration.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;

import java.io.IOException;
import java.sql.Timestamp;
import java.util.Date;
import java.util.Properties;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class TokenService {

    public static final Properties securityProperties = new Properties();
    static {
        try {
            securityProperties.load(TokenService.class.getResourceAsStream("/security.properties"));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        log.info("Loaded properties: {}", securityProperties);
    }

    private static final String SECRET = securityProperties.getProperty("JWT_SECRET");
    @Value("${application.security.jwt.expiration}")
    private long jwtExpiration;

    private static final Algorithm ALGORITHM = Algorithm.HMAC256(SECRET);

    @SuppressWarnings("deprecation")
    public String createTokenForVoting(String hash, int wahlkreis, Timestamp year) {
        return JWT.create()
                .withClaim("code", hash)
                .withClaim("wahlkreis", wahlkreis)
                .withClaim("year", year.getYear())
                .withExpiresAt(new Date(System.currentTimeMillis() + 24 * 60 * 60 * 1000))
                .sign(ALGORITHM);
    }
}