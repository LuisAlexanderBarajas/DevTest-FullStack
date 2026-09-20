package com.katamid.backend.auth.service;

import com.katamid.backend.auth.dto.AuthResponseDTO;
import com.katamid.backend.auth.dto.LoginRequestDTO;
import com.katamid.backend.auth.dto.RegisterRequestDTO;
import com.katamid.backend.auth.model.User;
import com.katamid.backend.auth.repository.UserRepository;
import com.katamid.backend.auth.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.quality.Strictness;
import org.mockito.junit.jupiter.MockitoSettings;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    private RegisterRequestDTO registerRequest;
    private LoginRequestDTO loginRequest;
    private User user;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequestDTO("testUser", "password123", "test@email.com");
        loginRequest = new LoginRequestDTO("testUser", "password123");

        user = new User();
        user.setId(1L);
        user.setUsername("testUser");
        user.setEmail("test@email.com");
        user.setPassword("encodedPassword");
        user.setRole("USER");
    }

    @Test
    void deberiaRegistrarUsuarioCorrectamente() throws Exception {
        when(userRepository.findByUsername("testUser")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(user);

        String result = authService.register(registerRequest);

        assertEquals("Usuario registrado exitosamente", result);
        verify(userRepository, times(1)).findByUsername("testUser");
        verify(passwordEncoder, times(1)).encode("password123");
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void deberiaLanzarExcepcionSiUsuarioYaExisteAlRegistrar() {
        when(userRepository.findByUsername("testUser")).thenReturn(Optional.of(user));

        assertThrows(Exception.class, () -> authService.register(registerRequest));
        verify(userRepository, times(1)).findByUsername("testUser");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void deberiaHacerLoginCorrectamente() throws Exception {
        when(userRepository.findByUsername("testUser")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "encodedPassword")).thenReturn(true);
        when(jwtUtil.generateToken(anyString(), anyString(), anyLong())).thenReturn("mock-jwt-token");

        AuthResponseDTO response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("mock-jwt-token", response.getToken());
        assertEquals("testUser", response.getUsername());
        verify(userRepository, times(1)).findByUsername("testUser");
        verify(passwordEncoder, times(1)).matches("password123", "encodedPassword");
        verify(jwtUtil, times(1)).generateToken("testUser", "USER", 1L);
    }

    @Test
    void deberiaLanzarExcepcionSiCredencialesSonInvalidas() {
        when(userRepository.findByUsername("testUser")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongPassword", "encodedPassword")).thenReturn(false);

        LoginRequestDTO invalidRequest = new LoginRequestDTO("testUser", "wrongPassword");

        assertThrows(Exception.class, () -> authService.login(invalidRequest));
        verify(userRepository, times(1)).findByUsername("testUser");
        verify(passwordEncoder, times(1)).matches("wrongPassword", "encodedPassword");
        verify(jwtUtil, never()).generateToken(anyString(), anyString(), anyLong());
    }
}