package com.katamid.backend.evaluation.service;

import com.katamid.backend.assessment.model.Assessment;
import com.katamid.backend.assessment.model.Question;
import com.katamid.backend.assessment.model.TestCase;
import com.katamid.backend.assessment.repository.AssessmentRepository;
import com.katamid.backend.assessment.repository.QuestionRepository;
import com.katamid.backend.auth.model.User;
import com.katamid.backend.auth.repository.UserRepository;
import com.katamid.backend.evaluation.dto.AnswerSubmissionDto;
import com.katamid.backend.evaluation.model.CandidateAssessment;
import com.katamid.backend.evaluation.repository.CandidateAssessmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.quality.Strictness;
import org.mockito.junit.jupiter.MockitoSettings;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class EvaluationServiceTest {

    @Mock
    private CandidateAssessmentRepository candidateAssessmentRepository;

    @Mock
    private AssessmentRepository assessmentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private QuestionRepository questionRepository;

    @InjectMocks
    private EvaluationService evaluationService;

    private User user;
    private Assessment assessment;
    private Question question;
    private CandidateAssessment attempt;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);

        assessment = new Assessment();
        assessment.setId(1L);
        assessment.setTimeLimitMinutes(60);

        TestCase testCase = new TestCase();
        testCase.setId(1L);

        question = new Question();
        question.setId(1L);
        question.setScore(10);
        question.setTestCases(List.of(testCase));

        attempt = new CandidateAssessment();
        attempt.setId(1L);
        attempt.setUser(user);
        attempt.setAssessment(assessment);
        attempt.setStatus("IN_PROGRESS");
        attempt.setStartedAt(LocalDateTime.now());
        attempt.setAnswers(new ArrayList<>());
    }

    @Test
    void deberiaIniciarEvaluacionCorrectamente() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(assessmentRepository.findById(1L)).thenReturn(Optional.of(assessment));
        when(candidateAssessmentRepository.save(any(CandidateAssessment.class))).thenReturn(attempt);

        CandidateAssessment result = evaluationService.startAssessment(1L, 1L);

        assertNotNull(result);
        assertEquals("IN_PROGRESS", result.getStatus());
        verify(userRepository, times(1)).findById(1L);
        verify(assessmentRepository, times(1)).findById(1L);
        verify(candidateAssessmentRepository, times(1)).save(any(CandidateAssessment.class));
    }

    @Test
    void deberiaLanzarExcepcionAlIniciarSiUsuarioNoExiste() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> evaluationService.startAssessment(1L, 1L));
        verify(userRepository, times(1)).findById(1L);
        verify(assessmentRepository, never()).findById(anyLong());
    }

    @Test
    void deberiaEnviarYCalificarEvaluacionCorrectamente() {
        AnswerSubmissionDto submission = new AnswerSubmissionDto();
        submission.setQuestionId(1L);
        submission.setSubmittedCode("print('Hello')");
        submission.setPassedTests(1);

        when(candidateAssessmentRepository.findById(1L)).thenReturn(Optional.of(attempt));
        when(questionRepository.findById(1L)).thenReturn(Optional.of(question));
        when(candidateAssessmentRepository.save(any(CandidateAssessment.class))).thenReturn(attempt);

        CandidateAssessment result = evaluationService.submitAssessment(1L, List.of(submission));

        assertNotNull(result);
        assertEquals("COMPLETED", result.getStatus());
        assertEquals(10, result.getTotalScore());
        verify(candidateAssessmentRepository, times(1)).findById(1L);
        verify(questionRepository, times(1)).findById(1L);
        verify(candidateAssessmentRepository, times(1)).save(any(CandidateAssessment.class));
    }

    @Test
    void deberiaLanzarExcepcionSiEvaluacionYaFueCompletada() {
        attempt.setStatus("COMPLETED");
        when(candidateAssessmentRepository.findById(1L)).thenReturn(Optional.of(attempt));

        assertThrows(IllegalStateException.class, () -> evaluationService.submitAssessment(1L, List.of()));
        verify(candidateAssessmentRepository, times(1)).findById(1L);
        verify(candidateAssessmentRepository, never()).save(any(CandidateAssessment.class));
    }

    @Test
    void deberiaObtenerPodiumCorrectamente() {
        when(candidateAssessmentRepository.findAllOrderedByScoreDesc()).thenReturn(List.of(attempt));

        List<CandidateAssessment> result = evaluationService.getPodium();

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(candidateAssessmentRepository, times(1)).findAllOrderedByScoreDesc();
    }

    @Test
    void deberiaObtenerIntentoPorId() {
        when(candidateAssessmentRepository.findById(1L)).thenReturn(Optional.of(attempt));

        Optional<CandidateAssessment> result = evaluationService.getAttemptById(1L);

        assertTrue(result.isPresent());
        verify(candidateAssessmentRepository, times(1)).findById(1L);
    }

    @Test
    void deberiaObtenerIntentosPorUsuario() {
        when(candidateAssessmentRepository.findByUserId(1L)).thenReturn(List.of(attempt));

        List<CandidateAssessment> result = evaluationService.getAttemptsByUserId(1L);

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(candidateAssessmentRepository, times(1)).findByUserId(1L);
    }

    @Test
    void deberiaObtenerPodiumPorAssessmentId() {
        when(candidateAssessmentRepository.findByAssessmentIdAndStatusOrderByTotalScoreDesc(1L, "COMPLETED"))
                .thenReturn(List.of(attempt));

        List<CandidateAssessment> result = evaluationService.getPodiumByAssessment(1L);

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(candidateAssessmentRepository, times(1))
                .findByAssessmentIdAndStatusOrderByTotalScoreDesc(1L, "COMPLETED");
    }
}