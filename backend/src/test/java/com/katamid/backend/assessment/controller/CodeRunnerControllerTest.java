package com.katamid.backend.assessment.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.katamid.backend.assessment.dto.CodeExecutionRequest;
import com.katamid.backend.assessment.dto.ExecutionResponse;
import com.katamid.backend.assessment.service.CodeRunnerService;
import com.katamid.backend.auth.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CodeRunnerController.class)
@WithMockUser
class CodeRunnerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private CodeRunnerService codeRunnerService;

    @MockitoBean
    private JwtUtil jwtUtil;

    private CodeExecutionRequest sampleRequest;
    private ExecutionResponse sampleResponse;

    @BeforeEach
    void setUp() {
        sampleRequest = new CodeExecutionRequest();

        sampleResponse = ExecutionResponse.builder()
                .passedCases(10)
                .totalCases(10)
                .scoreObtained(100.0)
                .consoleOutput("Success")
                .isSuccess(true)
                .build();
    }

    @Test
    void deberiaEjecutarCodigoCorrectamente() throws Exception {
        when(codeRunnerService.evaluateQuestion(any(CodeExecutionRequest.class))).thenReturn(sampleResponse);

        mockMvc.perform(post("/api/v1/code-runner/run").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleRequest)))
                .andExpect(status().isOk());

        verify(codeRunnerService, times(1)).evaluateQuestion(any(CodeExecutionRequest.class));
    }

    @Test
    void deberiaRetornarBadRequestSiHayExcepcion() throws Exception {
        when(codeRunnerService.evaluateQuestion(any(CodeExecutionRequest.class)))
                .thenThrow(new RuntimeException("Error de compilacion"));

        mockMvc.perform(post("/api/v1/code-runner/run").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Error de compilacion"));
    }
}