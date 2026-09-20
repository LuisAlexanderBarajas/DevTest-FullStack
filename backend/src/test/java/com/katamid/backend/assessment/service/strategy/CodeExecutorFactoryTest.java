package com.katamid.backend.assessment.service.strategy;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import com.katamid.backend.assessment.service.strategy.CodeExecutorStrategy;
import java.util.List;
import com.katamid.backend.assessment.service.strategy.CodeExecutorFactory;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class CodeExecutorFactoryTest {

    @Mock
    private CodeExecutorStrategy javaStrategy;

    @Mock
    private CodeExecutorStrategy pythonStrategy;

    private CodeExecutorFactory factory;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(javaStrategy.getSupportedLanguage()).thenReturn("java");
        when(pythonStrategy.getSupportedLanguage()).thenReturn("python");

        factory = new CodeExecutorFactory(List.of(javaStrategy, pythonStrategy));
    }

    @Test
    void deberiaRetornarEstrategiaCorrectaParaJava() {
        CodeExecutorStrategy strategy = factory.getStrategy("java");
        assertEquals(javaStrategy, strategy);
    }

    @Test
    void deberiaRetornarEstrategiaCorrectaIgnorandoMayusculas() {
        CodeExecutorStrategy strategy = factory.getStrategy("PYTHON");
        assertEquals(pythonStrategy, strategy);
    }

    @Test
    void deberiaLanzarExcepcionParaLenguajeNoSoportado() {
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            factory.getStrategy("javascript");
        });
        assertEquals("Lenguaje no soportado en la plataforma: javascript", exception.getMessage());
    }
}