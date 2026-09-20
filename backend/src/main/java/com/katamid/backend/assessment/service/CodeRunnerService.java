package com.katamid.backend.assessment.service;

import com.katamid.backend.assessment.dto.CodeExecutionRequest;
import com.katamid.backend.assessment.dto.ExecutionResponse;
import com.katamid.backend.assessment.model.Question;
import com.katamid.backend.assessment.model.TestCase;
import com.katamid.backend.assessment.repository.QuestionRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CodeRunnerService {

    private final QuestionRepository questionRepository;
    private final CodeExecutionService codeExecutionService;

    public CodeRunnerService(QuestionRepository questionRepository, CodeExecutionService codeExecutionService) {
        this.questionRepository = questionRepository;
        this.codeExecutionService = codeExecutionService;
    }

    public ExecutionResponse evaluateQuestion(CodeExecutionRequest request) {
        Question question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new RuntimeException("Pregunta no encontrada"));

        List<TestCase> testCases = question.getTestCases();
        if (testCases == null || testCases.isEmpty()) {
            throw new RuntimeException("La pregunta no tiene casos de prueba configurados.");
        }

        int passedCount = 0;
        StringBuilder consoleBuilder = new StringBuilder();
        consoleBuilder.append("--- INICIANDO EJECUCIÓN ---\n\n");

        for (int i = 0; i < testCases.size(); i++) {
            TestCase tc = testCases.get(i);
            String actualOutput = codeExecutionService.executeTest(request.getCode(), request.getLanguage(), tc.getInputData());
            String cleanActual = actualOutput.trim().replace("\r", "");
            String cleanExpected = tc.getExpectedOutput().trim().replace("\r", "");

            boolean passed = cleanActual.equals(cleanExpected);
            if (passed) passedCount++;

            if (tc.getIsHidden() != null && tc.getIsHidden()) {
                consoleBuilder.append("Caso de Prueba #").append(i + 1).append(" (Oculto): ");
                consoleBuilder.append(passed ? "[PASS]\n" : "[FAIL]\n");
            } else {
                consoleBuilder.append("Caso de Prueba #").append(i + 1).append(" (Público):\n");
                consoleBuilder.append("  Entrada: ").append(tc.getInputData()).append("\n");
                consoleBuilder.append("  Salida Esperada: ").append(cleanExpected).append("\n");
                consoleBuilder.append("  Salida Obtenida: \n").append(cleanActual).append("\n");
                consoleBuilder.append("  Resultado: ").append(passed ? "[PASS]\n\n" : "[FAIL]\n\n");
            }
        }

        double percentage = (double) passedCount / testCases.size();
        double finalScore = question.getScore() * percentage;

        consoleBuilder.append("\n--- RESUMEN ---\n");
        consoleBuilder.append("Casos superados: ").append(passedCount).append(" de ").append(testCases.size()).append("\n");
        consoleBuilder.append("Puntaje obtenido: ").append(String.format("%.2f", finalScore)).append(" / ").append(question.getScore()).append(" pts\n");

        return ExecutionResponse.builder()
                .passedCases(passedCount)
                .totalCases(testCases.size())
                .scoreObtained(finalScore)
                .consoleOutput(consoleBuilder.toString())
                .isSuccess(passedCount == testCases.size())
                .build();
    }
}