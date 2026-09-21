package com.katamid.backend.assessment.service.strategy;

import org.springframework.stereotype.Component;

@Component
public class TypeScriptExecutorStrategy implements CodeExecutorStrategy {

    @Override
    public String getSupportedLanguage() {
        return "typescript";
    }

    @Override
    public String getFileName() {
        return "main.ts";
    }

    @Override
    public String getDockerImage() {
        return "denoland/deno:alpine";
    }

    @Override
    public String getRunCommand() {
        return "deno run -q main.ts";
    }
}