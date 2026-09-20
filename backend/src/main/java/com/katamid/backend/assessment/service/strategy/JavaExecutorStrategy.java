package com.katamid.backend.assessment.service.strategy;

import org.springframework.stereotype.Component;

@Component
public class JavaExecutorStrategy implements CodeExecutorStrategy {
    @Override
    public String getSupportedLanguage() { return "java"; }

    @Override
    public String getFileName() { return "Main.java"; }

    @Override
    public String getDockerImage() { return "eclipse-temurin:17-jdk-alpine"; }

    @Override
    public String getRunCommand() { return "javac Main.java && java Main"; }
}