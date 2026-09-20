package com.katamid.backend.assessment.service.strategy;

import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class CodeExecutorFactory {
    private final Map<String, CodeExecutorStrategy> strategies;

    public CodeExecutorFactory(List<CodeExecutorStrategy> strategyList) {
        this.strategies = strategyList.stream()
                .collect(Collectors.toMap(s -> s.getSupportedLanguage().toLowerCase(), s -> s));
    }

    public CodeExecutorStrategy getStrategy(String language) {
        CodeExecutorStrategy strategy = strategies.get(language.toLowerCase());
        if (strategy == null) {
            throw new IllegalArgumentException("Lenguaje no soportado en la plataforma: " + language);
        }
        return strategy;
    }
}