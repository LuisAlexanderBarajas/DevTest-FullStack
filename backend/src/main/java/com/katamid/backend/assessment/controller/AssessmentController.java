package com.katamid.backend.assessment.controller;

import com.katamid.backend.assessment.model.Assessment;
import com.katamid.backend.assessment.service.AssessmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/assessments")
@CrossOrigin(origins = "*")
public class AssessmentController {

    private final AssessmentService assessmentService;

    public AssessmentController(AssessmentService assessmentService) {
        this.assessmentService = assessmentService;
    }

    @GetMapping
    public ResponseEntity<List<Assessment>> getAll() {
        return ResponseEntity.ok(assessmentService.getAllAssessments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(assessmentService.getAssessmentById(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<Assessment> create(@RequestBody Assessment assessment) {
        return ResponseEntity.ok(assessmentService.createAssessment(assessment));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Assessment assessmentDetails) {
        try {
            Assessment updated = assessmentService.updateAssessment(id, assessmentDetails);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            assessmentService.deleteAssessment(id);
            return ResponseEntity.ok().body("{\"message\": \"Evaluación eliminada correctamente\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }


}