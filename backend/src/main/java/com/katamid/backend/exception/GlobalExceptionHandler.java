package com.katamid.backend.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDatabaseExceptions(DataIntegrityViolationException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("error", "El correo o nombre de usuario ya se encuentra registrado en el sistema.");

        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneralExceptions(Exception ex) {
        ex.printStackTrace();
        Map<String, String> response = new HashMap<>();
        response.put("error", ex.getMessage());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
}