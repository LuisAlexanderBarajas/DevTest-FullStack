package com.katamid.backend.evaluation.service;

import com.katamid.backend.assessment.model.Assessment;
import com.katamid.backend.assessment.model.Question;
import com.katamid.backend.assessment.repository.AssessmentRepository;
import com.katamid.backend.assessment.repository.QuestionRepository;
import com.katamid.backend.auth.model.User;
import com.katamid.backend.auth.repository.UserRepository;
import com.katamid.backend.evaluation.dto.AnswerSubmissionDto;
import com.katamid.backend.evaluation.model.CandidateAssessment;
import com.katamid.backend.evaluation.model.CandidateAnswer;
import com.katamid.backend.evaluation.repository.CandidateAssessmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.ZoneId;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class EvaluationService {

    @Autowired
    private CandidateAssessmentRepository candidateAssessmentRepository;

    @Autowired
    private AssessmentRepository assessmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private QuestionRepository questionRepository;

    // Iniciar un intento de evaluación para un usuario
    public CandidateAssessment startAssessment(Long userId, Long assessmentId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Assessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new RuntimeException("Evaluación no encontrada"));

        CandidateAssessment attempt = new CandidateAssessment();
        attempt.setUser(user);
        attempt.setAssessment(assessment);
        attempt.setStatus("IN_PROGRESS");
        attempt.setStartedAt(LocalDateTime.now(ZoneId.of("UTC")));

        return candidateAssessmentRepository.save(attempt);
    }

    // Finalizar y calificar la prueba
    public CandidateAssessment submitAssessment(Long attemptId, List<AnswerSubmissionDto> submissions) {
        CandidateAssessment attempt = candidateAssessmentRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Intento de evaluación no encontrado"));

        if ("COMPLETED".equals(attempt.getStatus())) {
            throw new IllegalStateException("Esta evaluación ya fue completada y enviada anteriormente.");
        }

        int timeLimitMinutes = attempt.getAssessment().getTimeLimitMinutes();
        LocalDateTime deadline = attempt.getStartedAt().plusMinutes(timeLimitMinutes);

        if (LocalDateTime.now(ZoneId.of("UTC")).isAfter(deadline.plusMinutes(2))) {
            attempt.setStatus("COMPLETED");
            attempt.setSubmittedAt(LocalDateTime.now(ZoneId.of("UTC")));
            attempt.setTotalScore(0);
            return candidateAssessmentRepository.save(attempt);
        }

        int totalScoreCalculated = 0;

        attempt.getAnswers().clear();

        for (AnswerSubmissionDto sub : submissions) {
            CandidateAnswer answer = new CandidateAnswer();
            answer.setCandidateAssessment(attempt);

            Question question = questionRepository.findById(sub.getQuestionId())
                    .orElseThrow(() -> new RuntimeException("Pregunta no encontrada con ID: " + sub.getQuestionId()));

            answer.setQuestion(question);

            // Protegemos contra nulos en caso de que el candidato no haya escrito nada
            answer.setSubmittedCode(sub.getSubmittedCode() != null ? sub.getSubmittedCode() : "");
            int passed = sub.getPassedTests() != null ? sub.getPassedTests() : 0;
            answer.setPassedTests(passed);

            // Calculamos el puntaje real basado en los casos de prueba superados
            int totalTests = question.getTestCases() != null ? question.getTestCases().size() : 1;
            double percentage = totalTests > 0 ? (double) passed / totalTests : 0;
            int scoreForQuestion = (int) (question.getScore() * percentage);

            answer.setScoreObtained(scoreForQuestion);

            totalScoreCalculated += scoreForQuestion;
            attempt.getAnswers().add(answer);
        }

        attempt.setTotalScore(totalScoreCalculated);
        attempt.setStatus("COMPLETED");
        attempt.setSubmittedAt(LocalDateTime.now(ZoneId.of("UTC")));

        return candidateAssessmentRepository.save(attempt);
    }

    // Obtener el Podio para el Admin
    public List<CandidateAssessment> getPodium() {
        return candidateAssessmentRepository.findAllOrderedByScoreDesc();
    }

    public Optional<CandidateAssessment> getAttemptById(Long attemptId) {
        return candidateAssessmentRepository.findById(attemptId);
    }

    public List<CandidateAssessment> getAttemptsByUserId(Long userId) {
        return candidateAssessmentRepository.findByUserId(userId);
    }

    public List<CandidateAssessment> getPodiumByAssessment(Long assessmentId) {
        return candidateAssessmentRepository.findByAssessmentIdAndStatusOrderByTotalScoreDesc(assessmentId, "COMPLETED");
    }
}