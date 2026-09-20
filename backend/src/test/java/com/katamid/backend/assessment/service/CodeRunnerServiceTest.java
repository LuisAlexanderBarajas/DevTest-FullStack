package com.katamid.backend.assessment.service;

import com.katamid.backend.assessment.dto.CodeExecutionRequest;
import com.katamid.backend.assessment.dto.ExecutionResponse;
import com.katamid.backend.assessment.model.Question;
import com.katamid.backend.assessment.model.TestCase;
import com.katamid.backend.assessment.repository.QuestionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CodeRunnerServiceTest {

    @Mock
    private QuestionRepository questionRepository;

    @Mock
    private CodeExecutionService codeExecutionService;

    @InjectMocks
    private CodeRunnerService codeRunnerService;

    private CodeExecutionRequest request;
    private Question question;
    private TestCase testCase;

    @BeforeEach
    void setUp() {
        request = new CodeExecutionRequest();
        request.setQuestionId(1L);
        request.setLanguage("java");
        request.setCode("public class Main {}");

        testCase = new TestCase();
        testCase.setInputData("input");
        testCase.setExpectedOutput("output");

        question = new Question();
        question.setId(1L);
        question.setScore(10);
        question.setTestCases(List.of(testCase));
    }

    @Test
    void deberiaEvaluarPreguntaCorrectamente() throws Exception {
        when(questionRepository.findById(1L)).thenReturn(Optional.of(question));
        when(codeExecutionService.executeTest(anyString(), anyString(), anyString())).thenReturn("output");

        ExecutionResponse response = codeRunnerService.evaluateQuestion(request);

        assertNotNull(response);
        assertEquals(1, response.getPassedCases());
        assertEquals(1, response.getTotalCases());
        assertEquals(10.0, response.getScoreObtained());
        assertTrue(response.isSuccess());

        verify(questionRepository, times(1)).findById(1L);
        verify(codeExecutionService, times(1)).executeTest(anyString(), anyString(), anyString());
    }

    @Test
    void deberiaLanzarExcepcionSiPreguntaNoExiste() {
        when(questionRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> codeRunnerService.evaluateQuestion(request));
        verify(questionRepository, times(1)).findById(1L);
        verify(codeExecutionService, never()).executeTest(anyString(), anyString(), anyString());
    }
}