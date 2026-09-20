package com.katamid.backend.config;

import com.katamid.backend.assessment.controller.CodeRunnerController;
import com.katamid.backend.assessment.service.CodeRunnerService;
import com.katamid.backend.auth.util.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CodeRunnerController.class)
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CodeRunnerService codeRunnerService;

    @MockitoBean
    private JwtUtil jwtUtil;

    @Test
    @WithMockUser(roles = "CANDIDATE")
    void deberiaPermitirAccesoACandidateSiTieneRolAdecuado() throws Exception {
        mockMvc.perform(post("/api/v1/code-runner/run")
                        .contentType("application/json")
                        .content("{}"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deberiaDenegarAccesoACandidateSiEsAdmin() throws Exception {
        mockMvc.perform(post("/api/v1/code-runner/run")
                        .contentType("application/json")
                        .content("{}"))
                .andExpect(status().isForbidden());
    }
}