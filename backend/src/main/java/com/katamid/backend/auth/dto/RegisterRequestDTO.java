package com.katamid.backend.auth.dto;

public record RegisterRequestDTO(String username, String password, String email) {
}