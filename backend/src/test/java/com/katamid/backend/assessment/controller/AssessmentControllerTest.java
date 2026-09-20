package com.katamid.backend.assessment.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.katamid.backend.assessment.model.Assessment;
import com.katamid.backend.assessment.service.AssessmentService;
import com.katamid.backend.auth.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.security.test.context.support.WithMockUser;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AssessmentController.class)
@WithMockUser
class AssessmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AssessmentService assessmentService;
    @MockitoBean
    private JwtUtil jwtUtil;
    private Assessment sampleAssessment;

    @BeforeEach
    void setUp() {
        sampleAssessment = new Assessment();
    }

    @Test
    void deberiaObtenerTodasLasEvaluaciones() throws Exception {
        List<Assessment> assessments = Arrays.asList(sampleAssessment);
        when(assessmentService.getAllAssessments()).thenReturn(assessments);

        mockMvc.perform(get("/api/v1/assessments"))
                .andExpect(status().isOk());

        verify(assessmentService, times(1)).getAllAssessments();
    }

    @Test
    void deberiaObtenerEvaluacionPorId() throws Exception {
        when(assessmentService.getAssessmentById(1L)).thenReturn(sampleAssessment);

        mockMvc.perform(get("/api/v1/assessments/1"))
                .andExpect(status().isOk());

        verify(assessmentService, times(1)).getAssessmentById(1L);
    }

    @Test
    void deberiaRetornarBadRequestSiEvaluacionNoExistePorId() throws Exception {
        when(assessmentService.getAssessmentById(99L)).thenThrow(new RuntimeException("No encontrado"));

        mockMvc.perform(get("/api/v1/assessments/99"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("No encontrado"));
    }

    @Test
    void deberiaCrearEvaluacion() throws Exception {
        when(assessmentService.createAssessment(any(Assessment.class))).thenReturn(sampleAssessment);

        mockMvc.perform(post("/api/v1/assessments").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleAssessment)))
                .andExpect(status().isOk());

        verify(assessmentService, times(1)).createAssessment(any(Assessment.class));
    }

    @Test
    void deberiaActualizarEvaluacion() throws Exception {
        when(assessmentService.updateAssessment(eq(1L), any(Assessment.class))).thenReturn(sampleAssessment);

        mockMvc.perform(put("/api/v1/assessments/1").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleAssessment)))
                .andExpect(status().isOk());

        verify(assessmentService, times(1)).updateAssessment(eq(1L), any(Assessment.class));
    }

    @Test
    void deberiaEliminarEvaluacionCorrectamente() throws Exception {
        doNothing().when(assessmentService).deleteAssessment(1L);

        mockMvc.perform(delete("/api/v1/assessments/1").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());

        verify(assessmentService, times(1)).deleteAssessment(1L);
    }
}