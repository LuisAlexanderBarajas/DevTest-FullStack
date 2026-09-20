package com.katamid.backend.assessment.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CodeExecutionRequest {
    private Long questionId;
    private String language;
    private String code;
}