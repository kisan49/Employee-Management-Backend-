package com.example.employeemanagement.auth.service;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;

@Service
public class JwtService {
    private static final String ROLES_CLAIM = "roles";

    private final SecretKey key;
    private final long expirationMs;
    private final String issuer;
    private final String audience;

    public JwtService(
            @Value("${app.jwt.secret}") String base64Secret,
            @Value("${app.jwt.expiration-ms:14400000}") long expirationMs,
            @Value("${app.jwt.issuer:employee-management}") String issuer,
            @Value("${app.jwt.audience:employee-ui}") String audience
    ) {
        if (base64Secret == null || base64Secret.isBlank()) {
            throw new IllegalArgumentException("app.jwt.secret must be provided and be a Base64-encoded key of at least 32 bytes");
        }
        byte[] keyBytes;
        try {
            keyBytes = io.jsonwebtoken.io.Decoders.BASE64.decode(base64Secret);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("app.jwt.secret must be valid Base64 for a 32+ byte key", e);
        }
        if (keyBytes.length < 32) {
            throw new IllegalArgumentException("app.jwt.secret is too short: requires >= 32 bytes (256 bits) after Base64 decoding");
        }
        this.key = Keys.hmacShaKeyFor(keyBytes);
        this.expirationMs = expirationMs;
        this.issuer = issuer;
        this.audience = audience;
    }

    public String generateToken(String subject, Set<String> roles) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .setSubject(subject)
                .setId(UUID.randomUUID().toString())
                .setIssuer(issuer)
                .setAudience(audience)
                .claim(ROLES_CLAIM, roles)
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + expirationMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            return username != null && username.equals(userDetails.getUsername()) && !isTokenExpired(token);
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .setAllowedClockSkewSeconds(60)
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claimsResolver.apply(claims);
    }
}
