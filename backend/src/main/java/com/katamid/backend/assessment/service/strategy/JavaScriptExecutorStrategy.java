package com.katamid.backend.assessment.service.strategy;

import org.springframework.stereotype.Component;

@Component
public class JavaScriptExecutorStrategy implements CodeExecutorStrategy {
    @Override
    public String getSupportedLanguage() { return "javascript"; }

    @Override
    public String getFileName() { return "script.js"; }

    @Override
    public String getDockerImage() { return "node:18-alpine"; }

    @Override
    public String getRunCommand() { return "node script.js"; }
}