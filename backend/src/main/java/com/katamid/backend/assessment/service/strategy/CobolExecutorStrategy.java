package com.katamid.backend.assessment.service.strategy;

import org.springframework.stereotype.Component;

@Component
public class CobolExecutorStrategy implements CodeExecutorStrategy {

    @Override
    public String getSupportedLanguage() {
        return "cobol";
    }

    @Override
    public String getFileName() {
        return "main.cbl";
    }

    @Override
    public String getDockerImage() {
        return "devtest-cobol";
    }

    @Override
    public String getRunCommand() {
        return "cobc -x -o main main.cbl && ./main";
    }
}