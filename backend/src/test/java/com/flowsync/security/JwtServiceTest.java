package com.flowsync.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

public class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService("0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef", 3600000);
    }

    @Test
    void testGenerateAndValidateToken() {
        UserPrincipal principal = new UserPrincipal(
                "user-123",
                "Alice",
                "alice@example.com",
                "password",
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_MEMBER"))
        );

        String token = jwtService.generateToken(principal);
        assertNotNull(token);
        assertTrue(jwtService.validateToken(token));
        assertEquals("user-123", jwtService.getUserIdFromToken(token));
    }

    @Test
    void testInvalidToken() {
        assertFalse(jwtService.validateToken("invalid.token.string"));
    }
}
