package com.katamid.backend.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.katamid.backend.auth.dto.AuthResponseDTO;
import com.katamid.backend.auth.dto.LoginRequestDTO;
import com.katamid.backend.auth.dto.RegisterRequestDTO;
import com.katamid.backend.auth.service.AuthService;
import com.katamid.backend.auth.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@WithMockUser
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private JwtUtil jwtUtil;

    private RegisterRequestDTO registerRequest;
    private LoginRequestDTO loginRequest;
    private AuthResponseDTO authResponse;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequestDTO("testUser", "test@email.com", "password123");
        loginRequest = new LoginRequestDTO("test@email.com", "password123");
        authResponse = new AuthResponseDTO(1L, "jwt-token-sample", "testUser", "test@email.com");
    }

    @Test
    void deberiaRegistrarUsuarioCorrectamente() throws Exception {
        when(authService.register(any(RegisterRequestDTO.class))).thenReturn("Usuario registrado con éxito");

        mockMvc.perform(post("/api/v1/auth/register").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Usuario registrado con éxito"));

        verify(authService, times(1)).register(any(RegisterRequestDTO.class));
    }

    @Test
    void deberiaHacerLoginCorrectamente() throws Exception {
        when(authService.login(any(LoginRequestDTO.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/v1/auth/login").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk());

        verify(authService, times(1)).login(any(LoginRequestDTO.class));
    }
}