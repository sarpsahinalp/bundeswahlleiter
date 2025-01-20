package db.in.tum.de.datenbanken.configuration.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;

import java.io.IOException;
import java.util.Date;
import java.util.Properties;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class TokenService {

    static final Properties securityProperties = new Properties();
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

    public String createTokenForVoting(String hash) {
        return JWT.create()
                .withClaim("code", hash)
                .withExpiresAt(new Date(System.currentTimeMillis() + 24 * 60 * 60 * 1000))
                .sign(ALGORITHM);
    }
}