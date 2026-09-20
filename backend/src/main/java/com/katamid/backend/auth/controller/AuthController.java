package com.katamid.backend.auth.controller;

import com.katamid.backend.auth.dto.AuthResponseDTO;
import com.katamid.backend.auth.dto.LoginRequestDTO;
import com.katamid.backend.auth.dto.RegisterRequestDTO;
import com.katamid.backend.auth.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody RegisterRequestDTO request) throws Exception {
        String message = authService.register(request);
        Map<String, String> response = new HashMap<>();
        response.put("message", message);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody LoginRequestDTO request) throws Exception {
        AuthResponseDTO response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}