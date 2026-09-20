package com.katamid.backend.assessment.service;

import com.katamid.backend.assessment.model.Assessment;
import com.katamid.backend.assessment.model.Question;
import com.katamid.backend.assessment.model.TestCase;
import com.katamid.backend.assessment.repository.AssessmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AssessmentServiceTest {

    @Mock
    private AssessmentRepository assessmentRepository;

    @InjectMocks
    private AssessmentService assessmentService;

    private Assessment assessment;
    private Question question;
    private TestCase testCase;

    @BeforeEach
    void setUp() {
        testCase = new TestCase();
        testCase.setInputData(" input ");
        testCase.setExpectedOutput(" output ");

        question = new Question();
        question.setTestCases(new ArrayList<>(List.of(testCase)));

        assessment = new Assessment();
        assessment.setId(1L);
        assessment.setName("Evaluacion de prueba");
        assessment.setIsActive(true);
        assessment.setQuestions(new ArrayList<>(List.of(question)));
    }

    @Test
    void deberiaObtenerTodasLasEvaluacionesActivas() {
        when(assessmentRepository.findByIsActiveTrue()).thenReturn(List.of(assessment));

        List<Assessment> result = assessmentService.getAllAssessments();

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(assessmentRepository, times(1)).findByIsActiveTrue();
    }

    @Test
    void deberiaObtenerEvaluacionPorId() throws Exception {
        when(assessmentRepository.findById(1L)).thenReturn(Optional.of(assessment));

        Assessment result = assessmentService.getAssessmentById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(assessmentRepository, times(1)).findById(1L);
    }

    @Test
    void deberiaLanzarExcepcionCuandoNoExisteEvaluacionPorId() {
        when(assessmentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(Exception.class, () -> assessmentService.getAssessmentById(99L));
        verify(assessmentRepository, times(1)).findById(99L);
    }

    @Test
    void deberiaCrearEvaluacion() {
        when(assessmentRepository.save(any(Assessment.class))).thenReturn(assessment);

        Assessment result = assessmentService.createAssessment(assessment);

        assertNotNull(result);
        assertEquals(assessment, question.getAssessment());
        assertEquals(question, testCase.getQuestion());
        assertEquals("input", testCase.getInputData());
        assertEquals("output", testCase.getExpectedOutput());
        verify(assessmentRepository, times(1)).save(assessment);
    }

    @Test
    void deberiaActualizarEvaluacion() {
        Assessment updatedAssessment = new Assessment();
        updatedAssessment.setName("Nombre actualizado");
        updatedAssessment.setDescription("Descripcion actualizada");
        updatedAssessment.setTimeLimitMinutes(60);
        updatedAssessment.setQuestionCount(5);
        updatedAssessment.setQuestions(new ArrayList<>(List.of(question)));

        when(assessmentRepository.findById(1L)).thenReturn(Optional.of(assessment));
        when(assessmentRepository.save(any(Assessment.class))).thenReturn(assessment);

        Assessment result = assessmentService.updateAssessment(1L, updatedAssessment);

        assertNotNull(result);
        assertEquals("Nombre actualizado", assessment.getName());
        assertEquals("Descripcion actualizada", assessment.getDescription());
        assertEquals(60, assessment.getTimeLimitMinutes());
        assertEquals(5, assessment.getQuestionCount());
        assertEquals("input", testCase.getInputData());
        assertEquals("output", testCase.getExpectedOutput());
        verify(assessmentRepository, times(1)).findById(1L);
        verify(assessmentRepository, times(1)).save(assessment);
    }

    @Test
    void deberiaLanzarExcepcionAlActualizarSiNoExiste() {
        when(assessmentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> assessmentService.updateAssessment(99L, new Assessment()));
        verify(assessmentRepository, times(1)).findById(99L);
        verify(assessmentRepository, never()).save(any(Assessment.class));
    }

    @Test
    void deberiaEliminarEvaluacionSoftDelete() {
        when(assessmentRepository.findById(1L)).thenReturn(Optional.of(assessment));
        when(assessmentRepository.save(any(Assessment.class))).thenReturn(assessment);

        assessmentService.deleteAssessment(1L);

        assertFalse(assessment.getIsActive());
        verify(assessmentRepository, times(1)).findById(1L);
        verify(assessmentRepository, times(1)).save(assessment);
    }

    @Test
    void deberiaLanzarExcepcionAlEliminarSiNoExiste() {
        when(assessmentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> assessmentService.deleteAssessment(99L));
        verify(assessmentRepository, times(1)).findById(99L);
        verify(assessmentRepository, never()).save(any(Assessment.class));
    }
}