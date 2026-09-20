package com.katamid.backend.assessment.service.strategy;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class JavaScriptExecutorStrategyTest {

    private JavaScriptExecutorStrategy strategy;

    @BeforeEach
    void setUp() {
        strategy = new JavaScriptExecutorStrategy();
    }

    @Test
    void deberiaRetornarLenguajeSoportado() {
        assertEquals("javascript", strategy.getSupportedLanguage());
    }

    @Test
    void deberiaRetornarNombreDeArchivo() {
        assertEquals("script.js", strategy.getFileName());
    }

    @Test
    void deberiaRetornarImagenDocker() {
        assertEquals("node:18-alpine", strategy.getDockerImage());
    }

    @Test
    void deberiaRetornarComandoDeEjecucion() {
        assertEquals("node script.js", strategy.getRunCommand());
    }
}