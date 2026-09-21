package com.katamid.backend.assessment.service;

import com.katamid.backend.assessment.service.strategy.CodeExecutorFactory;
import com.katamid.backend.assessment.service.strategy.CodeExecutorStrategy;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedConstruction;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.quality.Strictness;
import org.mockito.junit.jupiter.MockitoSettings;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class CodeExecutionServiceTest {

    @Mock
    private CodeExecutorFactory executorFactory;

    @Mock
    private CodeExecutorStrategy strategy;

    @InjectMocks
    private CodeExecutionService codeExecutionService;

    @Test
    void deberiaEjecutarTestCorrectamente() {
        when(executorFactory.getStrategy("java")).thenReturn(strategy);
        when(strategy.getFileName()).thenReturn("Main.java");
        when(strategy.getDockerImage()).thenReturn("eclipse-temurin:17-jdk-alpine");
        when(strategy.getRunCommand()).thenReturn("javac Main.java && java Main");

        try (MockedConstruction<ProcessBuilder> mockedProcessBuilder = mockConstruction(ProcessBuilder.class, (mock, context) -> {
            Process mockProcess = mock(Process.class);
            when(mockProcess.waitFor(30, TimeUnit.SECONDS)).thenReturn(true);

            InputStream mockInputStream = new ByteArrayInputStream("Ejecucion exitosa".getBytes());
            when(mockProcess.getInputStream()).thenReturn(mockInputStream);

            when(mock.start()).thenReturn(mockProcess);
        })) {
            String result = codeExecutionService.executeTest("codigo_java", "java", "entrada");

            assertEquals("Ejecucion exitosa", result);
        }
    }

    @Test
    void deberiaRetornarTimeoutSiExcedeElTiempo() {
        when(executorFactory.getStrategy("python")).thenReturn(strategy);
        when(strategy.getFileName()).thenReturn("script.py");
        when(strategy.getDockerImage()).thenReturn("python:3.9-slim");
        when(strategy.getRunCommand()).thenReturn("python script.py");

        try (MockedConstruction<ProcessBuilder> mockedProcessBuilder = mockConstruction(ProcessBuilder.class, (mock, context) -> {
            Process mockProcess = mock(Process.class);
            when(mockProcess.waitFor(5, TimeUnit.SECONDS)).thenReturn(false);

            when(mock.start()).thenReturn(mockProcess);
        })) {
            String result = codeExecutionService.executeTest("codigo_python", "python", "entrada");

            assertEquals("Error: Tiempo límite de ejecución excedido (Timeout).", result);
        }
    }

    @Test
    void deberiaRetornarErrorInternoSiOcurreExcepcion() {
        when(executorFactory.getStrategy("javascript")).thenThrow(new IllegalArgumentException("Lenguaje no soportado"));

        String result = codeExecutionService.executeTest("codigo_js", "javascript", "entrada");

        assertTrue(result.startsWith("Error interno de ejecución:"));
        assertTrue(result.contains("Lenguaje no soportado"));
    }
}