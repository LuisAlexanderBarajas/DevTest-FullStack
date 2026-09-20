package com.katamid.backend.assessment.controller;

import com.katamid.backend.assessment.dto.CodeExecutionRequest;
import com.katamid.backend.assessment.dto.ExecutionResponse;
import com.katamid.backend.assessment.service.CodeRunnerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/code-runner")
@CrossOrigin(origins = "*")
public class CodeRunnerController {

    private final CodeRunnerService codeRunnerService;

    public CodeRunnerController(CodeRunnerService codeRunnerService) {
        this.codeRunnerService = codeRunnerService;
    }

    @PostMapping("/run")
    public ResponseEntity<?> runCode(@RequestBody CodeExecutionRequest request) {
        try {
            ExecutionResponse response = codeRunnerService.evaluateQuestion(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }
}