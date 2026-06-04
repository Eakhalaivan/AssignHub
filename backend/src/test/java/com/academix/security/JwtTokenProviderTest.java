package com.academix.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider tokenProvider;
    private final String secret = "academix-super-secret-key-must-be-256-bits-long-for-hs256-algo";
    private final long expiration = 3600000;

    @BeforeEach
    void setUp() {
        tokenProvider = new JwtTokenProvider(secret, expiration);
    }

    @Test
    void generateToken_WithAuthentication_IncludesRole() {
        UserDetails userDetails = new User("test@example.com", "password", 
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN")));
        Authentication auth = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

        String token = tokenProvider.generateToken(auth);

        assertEquals("test@example.com", tokenProvider.getUserEmailFromJWT(token));
        assertEquals("ROLE_ADMIN", tokenProvider.getRoleFromJWT(token));
    }

    @Test
    void generateToken_WithUsernameAndRole_IncludesRole() {
        String token = tokenProvider.generateToken("student@example.com", "STUDENT");

        assertEquals("student@example.com", tokenProvider.getUserEmailFromJWT(token));
        assertEquals("ROLE_STUDENT", tokenProvider.getRoleFromJWT(token));
    }

    @Test
    void validateToken_ValidToken_ReturnsTrue() {
        String token = tokenProvider.generateToken("user@example.com", "WRITER");
        assertTrue(tokenProvider.validateToken(token));
    }
}
