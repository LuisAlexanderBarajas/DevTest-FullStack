package com.katamid.backend.evaluation.dto;

import lombok.Data;

@Data
public class AnswerSubmissionDto {
    private Long questionId;
    private String submittedCode;
    private Integer passedTests;
}