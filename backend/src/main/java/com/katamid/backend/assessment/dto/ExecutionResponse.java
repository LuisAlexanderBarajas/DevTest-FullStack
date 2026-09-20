package com.katamid.backend.assessment.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ExecutionResponse {
    private int passedCases;
    private int totalCases;
    private double scoreObtained;
    private String consoleOutput;
    private boolean isSuccess;
}