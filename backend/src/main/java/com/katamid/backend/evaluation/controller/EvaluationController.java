package com.katamid.backend.evaluation.controller;

import com.katamid.backend.evaluation.dto.AnswerSubmissionDto;
import com.katamid.backend.evaluation.model.CandidateAssessment;
import com.katamid.backend.evaluation.service.EvaluationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/evaluations")
@CrossOrigin(origins = "*")
public class EvaluationController {

    @Autowired
    private EvaluationService evaluationService;

    @PostMapping("/start")
    public ResponseEntity<CandidateAssessment> startAssessment(
            @RequestParam Long userId,
            @RequestParam Long assessmentId) {
        return ResponseEntity.ok(evaluationService.startAssessment(userId, assessmentId));
    }

    @PostMapping("/{attemptId}/submit")
    public ResponseEntity<CandidateAssessment> submitAssessment(
            @PathVariable Long attemptId,
            @RequestBody List<AnswerSubmissionDto> submissions) {
        return ResponseEntity.ok(evaluationService.submitAssessment(attemptId, submissions));
    }

    @GetMapping("/podium")
    public ResponseEntity<List<CandidateAssessment>> getPodium() {
        return ResponseEntity.ok(evaluationService.getPodium());
    }

    @GetMapping("/attempt/{attemptId}")
    public ResponseEntity<CandidateAssessment> getAttemptResult(@PathVariable Long attemptId) {
        return evaluationService.getAttemptById(attemptId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CandidateAssessment>> getAttemptsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(evaluationService.getAttemptsByUserId(userId));
    }

    @GetMapping("/podium/{assessmentId}")
    public ResponseEntity<List<CandidateAssessment>> getPodiumByAssessmentId(@PathVariable Long assessmentId) {
        return ResponseEntity.ok(evaluationService.getPodiumByAssessment(assessmentId));
    }

}