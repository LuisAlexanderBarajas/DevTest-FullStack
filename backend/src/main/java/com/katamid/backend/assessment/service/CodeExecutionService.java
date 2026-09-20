package com.katamid.backend.assessment.service;

import com.katamid.backend.assessment.service.strategy.CodeExecutorFactory;
import com.katamid.backend.assessment.service.strategy.CodeExecutorStrategy;
import org.springframework.stereotype.Service;
import java.io.*;
import java.nio.file.*;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class CodeExecutionService {

    private static final String BASE_TEMP_DIR = System.getProperty("user.dir") + "/temp_executions";

    private final CodeExecutorFactory executorFactory;

    public CodeExecutionService(CodeExecutorFactory executorFactory) {
        this.executorFactory = executorFactory;
    }

    public String executeTest(String code, String language, String input) {
        String executionId = UUID.randomUUID().toString();
        Path tempDirPath = Paths.get(BASE_TEMP_DIR, executionId);

        try {
            Files.createDirectories(tempDirPath);

            CodeExecutorStrategy strategy = executorFactory.getStrategy(language);

            Files.writeString(tempDirPath.resolve(strategy.getFileName()), code);
            Files.writeString(tempDirPath.resolve("input.txt"), input != null ? input : "");

            String[] dockerCommand = {
                    "docker", "run", "--rm",
                    "--name", executionId,
                    "--memory=256m",
                    "--cpus=0.5",
                    "--network", "none",
                    "-v", tempDirPath.toAbsolutePath().toString().replace("\\", "/") + ":/app",
                    "-w", "/app",
                    strategy.getDockerImage(),
                    "sh", "-c", strategy.getRunCommand() + " < input.txt"
            };

            ProcessBuilder processBuilder = new ProcessBuilder(dockerCommand);
            processBuilder.redirectErrorStream(true);
            Process process = processBuilder.start();

            boolean finished = process.waitFor(5, TimeUnit.SECONDS);

            if (!finished) {
                process.destroyForcibly();

                try {
                    Runtime.getRuntime().exec("docker kill " + executionId);
                } catch (Exception e) {
                    System.err.println("Error al matar el contenedor zombi: " + e.getMessage());
                }

                return "Error: Tiempo límite de ejecución excedido (Timeout).";
            }

            return readProcessOutput(process.getInputStream());

        } catch (Exception e) {
            return "Error interno de ejecución: " + e.getMessage();
        } finally {
            deleteDirectory(tempDirPath.toFile());
        }
    }

    private String readProcessOutput(InputStream inputStream) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
        StringBuilder output = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            output.append(line).append("\n");
        }
        return output.toString().trim();
    }

    private void deleteDirectory(File directoryToBeDeleted) {
        File[] allContents = directoryToBeDeleted.listFiles();
        if (allContents != null) {
            for (File file : allContents) {
                deleteDirectory(file);
            }
        }
        directoryToBeDeleted.delete();
    }
}