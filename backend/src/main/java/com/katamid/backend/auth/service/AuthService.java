package com.katamid.backend.auth.service;

import com.katamid.backend.auth.dto.AuthResponseDTO;
import com.katamid.backend.auth.dto.LoginRequestDTO;
import com.katamid.backend.auth.dto.RegisterRequestDTO;
import com.katamid.backend.auth.model.User;
import com.katamid.backend.auth.repository.UserRepository;
import com.katamid.backend.auth.util.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public String register(RegisterRequestDTO request) throws Exception {
        if (userRepository.findByUsername(request.username()).isPresent()) {
            throw new Exception("El usuario ya existe");
        }

        User newUser = new User();
        newUser.setUsername(request.username());
        newUser.setEmail(request.email());
        newUser.setPassword(passwordEncoder.encode(request.password()));

        userRepository.save(newUser);
        return "Usuario registrado exitosamente";
    }

    public AuthResponseDTO login(LoginRequestDTO request) throws Exception {
        Optional<User> userOpt = userRepository.findByUsername(request.username());

        if (userOpt.isPresent() && passwordEncoder.matches(request.password(), userOpt.get().getPassword())) {
            User user = userOpt.get();
            String token = jwtUtil.generateToken(user.getUsername(),user.getRole(),user.getId());

            return new AuthResponseDTO(user.getId(),token, user.getUsername(), user.getRole());
        }
        throw new Exception("Credenciales inválidas");
    }
}