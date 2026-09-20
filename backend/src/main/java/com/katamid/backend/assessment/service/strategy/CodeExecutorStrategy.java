package com.katamid.backend.assessment.service.strategy;

public interface CodeExecutorStrategy {
    String getSupportedLanguage();
    String getFileName();
    String getDockerImage();
    String getRunCommand();
}