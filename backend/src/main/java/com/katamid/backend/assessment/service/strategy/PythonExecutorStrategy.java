package com.katamid.backend.assessment.service.strategy;

import org.springframework.stereotype.Component;

@Component
public class PythonExecutorStrategy implements CodeExecutorStrategy {
    @Override
    public String getSupportedLanguage() { return "python"; }

    @Override
    public String getFileName() { return "script.py"; }

    @Override
    public String getDockerImage() { return "python:3.9-slim"; }

    @Override
    public String getRunCommand() { return "python script.py"; }
}