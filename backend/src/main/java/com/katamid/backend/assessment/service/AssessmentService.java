package com.katamid.backend.assessment.service;

import com.katamid.backend.assessment.model.Assessment;
import com.katamid.backend.assessment.repository.AssessmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AssessmentService {

    private final AssessmentRepository assessmentRepository;

    public AssessmentService(AssessmentRepository assessmentRepository) {
        this.assessmentRepository = assessmentRepository;
    }

    // Listar todas las evaluaciones disponibles
    public List<Assessment> getAllAssessments() {
        return assessmentRepository.findByIsActiveTrue();
    }

    // Obtener el detalle de una evaluación por su ID
    public Assessment getAssessmentById(Long id) throws Exception {
        return assessmentRepository.findById(id)
                .orElseThrow(() -> new Exception("Evaluación no encontrada"));
    }

    // Crear una nueva evaluación con sus preguntas y casos de prueba
    public Assessment createAssessment(Assessment assessment) {
        if (assessment.getQuestions() != null) {
            assessment.getQuestions().forEach(question -> {
                question.setAssessment(assessment);
                if (question.getTestCases() != null) {
                    question.getTestCases().forEach(testCase -> {
                        testCase.setQuestion(question);

                        if (testCase.getInputData() != null) {
                            testCase.setInputData(testCase.getInputData().trim());
                        }
                        if (testCase.getExpectedOutput() != null) {
                            testCase.setExpectedOutput(testCase.getExpectedOutput().trim());
                        }
                    });
                }
            });
        }
        return assessmentRepository.save(assessment);
    }


    public Assessment updateAssessment(Long id, Assessment updatedAssessment) {
        Assessment existing = assessmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Evaluación no encontrada"));

        existing.setName(updatedAssessment.getName());
        existing.setDescription(updatedAssessment.getDescription());
        existing.setTimeLimitMinutes(updatedAssessment.getTimeLimitMinutes());
        existing.setQuestionCount(updatedAssessment.getQuestionCount());

        if (updatedAssessment.getQuestions() != null) {
            updatedAssessment.getQuestions().forEach(question -> {
                question.setAssessment(existing);

                if (question.getTestCases() != null) {
                    question.getTestCases().forEach(testCase -> {
                        testCase.setQuestion(question);

                        if (testCase.getInputData() != null) {
                            testCase.setInputData(testCase.getInputData().trim());
                        }
                        if (testCase.getExpectedOutput() != null) {
                            testCase.setExpectedOutput(testCase.getExpectedOutput().trim());
                        }
                    });
                }
            });
        }

        existing.getQuestions().clear();
        if (updatedAssessment.getQuestions() != null) {
            existing.getQuestions().addAll(updatedAssessment.getQuestions());
        }

        return assessmentRepository.save(existing);
    }

    public void deleteAssessment(Long id) {
        Assessment assessment = assessmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Evaluación no encontrada"));

        assessment.setIsActive(false);
        assessmentRepository.save(assessment);
    }

}