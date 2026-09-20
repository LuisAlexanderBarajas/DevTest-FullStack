package com.katamid.backend.auth.util;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;
    private String token;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secretKey", "mySecretKey123456789012345678901234567890");
        ReflectionTestUtils.setField(jwtUtil, "jwtExpirationMs", 3600000L);

        token = jwtUtil.generateToken("testUser", "USER", 1L);
    }

    @Test
    void deberiaGenerarYExtraerUsernameCorrectamente() {
        String username = jwtUtil.extractUsername(token);
        assertEquals("testUser", username);
    }

    @Test
    void deberiaExtraerRolCorrectamente() {
        String role = jwtUtil.extractRole(token);
        assertEquals("USER", role);
    }

    @Test
    void deberiaValidarTokenCorrectamente() {
        boolean isValid = jwtUtil.isTokenValid(token);
        assertTrue(isValid);
    }

    @Test
    void deberiaRetornarFalsoParaTokenInvalido() {
        boolean isValid = jwtUtil.isTokenValid("token.invalido.falso");
        assertFalse(isValid);
    }
}