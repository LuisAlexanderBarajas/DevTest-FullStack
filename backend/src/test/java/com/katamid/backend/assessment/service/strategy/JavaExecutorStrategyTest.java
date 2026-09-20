package com.katamid.backend.assessment.service.strategy;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class JavaExecutorStrategyTest {

    private JavaExecutorStrategy strategy;

    @BeforeEach
    void setUp() {
        strategy = new JavaExecutorStrategy();
    }

    @Test
    void deberiaRetornarLenguajeSoportado() {
        assertEquals("java", strategy.getSupportedLanguage());
    }

    @Test
    void deberiaRetornarNombreDeArchivo() {
        assertEquals("Main.java", strategy.getFileName());
    }

    @Test
    void deberiaRetornarImagenDocker() {
        assertEquals("eclipse-temurin:17-jdk-alpine", strategy.getDockerImage());
    }

    @Test
    void deberiaRetornarComandoDeEjecucion() {
        assertEquals("javac Main.java && java Main", strategy.getRunCommand());
    }
}