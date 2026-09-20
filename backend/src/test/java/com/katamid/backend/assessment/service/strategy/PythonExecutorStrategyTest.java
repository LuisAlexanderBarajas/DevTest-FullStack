package com.katamid.backend.assessment.service.strategy;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class PythonExecutorStrategyTest {

    private PythonExecutorStrategy strategy;

    @BeforeEach
    void setUp() {
        strategy = new PythonExecutorStrategy();
    }

    @Test
    void deberiaRetornarLenguajeSoportado() {
        assertEquals("python", strategy.getSupportedLanguage());
    }

    @Test
    void deberiaRetornarNombreDeArchivo() {
        assertEquals("script.py", strategy.getFileName());
    }

    @Test
    void deberiaRetornarImagenDocker() {
        assertEquals("python:3.9-slim", strategy.getDockerImage());
    }

    @Test
    void deberiaRetornarComandoDeEjecucion() {
        assertEquals("python script.py", strategy.getRunCommand());
    }
}