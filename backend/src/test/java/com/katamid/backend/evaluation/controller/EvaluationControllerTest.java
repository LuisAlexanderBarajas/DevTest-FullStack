package com.katamid.backend.evaluation.controller;

import com.katamid.backend.auth.util.JwtUtil;
import com.katamid.backend.evaluation.model.CandidateAssessment;
import com.katamid.backend.evaluation.service.EvaluationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(EvaluationController.class)
class EvaluationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private EvaluationService evaluationService;

    @MockitoBean
    private JwtUtil jwtUtil;

    @Test
    @WithMockUser(roles = "CANDIDATE")
    void deberiaIniciarEvaluacionCorrectamente() throws Exception {
        CandidateAssessment candidateAssessment = new CandidateAssessment();
        when(evaluationService.startAssessment(1L, 1L)).thenReturn(candidateAssessment);

        mockMvc.perform(post("/api/v1/evaluations/start")
                        .param("userId", "1")
                        .param("assessmentId", "1")
                        .with(csrf()))
                .andExpect(status().isOk());

        verify(evaluationService, times(1)).startAssessment(1L, 1L);
    }

    @Test
    @WithMockUser(roles = "CANDIDATE")
    void deberiaEnviarEvaluacionCorrectamente() throws Exception {
        CandidateAssessment candidateAssessment = new CandidateAssessment();
        when(evaluationService.submitAssessment(eq(1L), any())).thenReturn(candidateAssessment);

        mockMvc.perform(post("/api/v1/evaluations/1/submit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[]")
                        .with(csrf()))
                .andExpect(status().isOk());

        verify(evaluationService, times(1)).submitAssessment(eq(1L), any());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deberiaObtenerPodiumCorrectamente() throws Exception {
        when(evaluationService.getPodium()).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/evaluations/podium"))
                .andExpect(status().isOk());

        verify(evaluationService, times(1)).getPodium();
    }

    @Test
    @WithMockUser(roles = "CANDIDATE")
    void deberiaObtenerIntentoPorId() throws Exception {
        CandidateAssessment candidateAssessment = new CandidateAssessment();
        when(evaluationService.getAttemptById(1L)).thenReturn(Optional.of(candidateAssessment));

        mockMvc.perform(get("/api/v1/evaluations/attempt/1"))
                .andExpect(status().isOk());

        verify(evaluationService, times(1)).getAttemptById(1L);
    }

    @Test
    @WithMockUser(roles = "CANDIDATE")
    void deberiaRetornar404SiIntentoNoExiste() throws Exception {
        when(evaluationService.getAttemptById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/v1/evaluations/attempt/99"))
                .andExpect(status().isNotFound());

        verify(evaluationService, times(1)).getAttemptById(99L);
    }

    @Test
    @WithMockUser(roles = "CANDIDATE")
    void deberiaObtenerIntentosPorUsuario() throws Exception {
        when(evaluationService.getAttemptsByUserId(1L)).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/evaluations/user/1"))
                .andExpect(status().isOk());

        verify(evaluationService, times(1)).getAttemptsByUserId(1L);
    }

    @Test
    @WithMockUser(roles = "CANDIDATE")
    void deberiaObtenerPodiumPorAssessmentId() throws Exception {
        when(evaluationService.getPodiumByAssessment(1L)).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/evaluations/podium/1"))
                .andExpect(status().isOk());

        verify(evaluationService, times(1)).getPodiumByAssessment(1L);
    }
}