package com.katamid.backend.evaluation.model;

import com.katamid.backend.assessment.model.Assessment;
import com.katamid.backend.auth.model.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.Transient;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Duration;

@Entity
@Table(name = "candidate_assessments")
@Getter
@Setter
public class CandidateAssessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relación con el usuario (candidato) que presenta la prueba
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Relación con la evaluación que se está presentando
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assessment_id", nullable = false)
    private Assessment assessment;

    @Column(nullable = false)
    private String status;

    private Integer totalScore = 0;

    @Column(nullable = false)
    private LocalDateTime startedAt = LocalDateTime.now();

    private LocalDateTime submittedAt;

    // Relación con las respuestas enviadas por cada pregunta en este intento
    @OneToMany(mappedBy = "candidateAssessment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CandidateAnswer> answers = new ArrayList<>();

    @Transient
    @JsonProperty("maxScore")
    public Integer getMaxScore() {
        if (assessment != null && assessment.getQuestions() != null) {
            return assessment.getQuestions().stream()
                    .mapToInt(com.katamid.backend.assessment.model.Question::getScore)
                    .sum();
        }
        return 100;
    }

    @Transient
    @JsonProperty("totalQuestions")
    public Integer getTotalQuestions() {
        if (assessment != null && assessment.getQuestions() != null) {
            return assessment.getQuestions().size();
        }
        return 0;
    }

    @Transient
    @JsonProperty("passedQuestions")
    public Long getPassedQuestions() {
        if (answers != null) {
            return answers.stream()
                    .filter(a -> a.getScoreObtained() != null && a.getQuestion() != null
                            && a.getScoreObtained().equals(a.getQuestion().getScore()))
                    .count();
        }
        return 0L;
    }

    @Transient
    @JsonProperty("timeSpent")
    public String getTimeSpent() {
        if (startedAt != null && submittedAt != null) {
            long minutes = Duration.between(startedAt, submittedAt).toMinutes();
            long seconds = Duration.between(startedAt, submittedAt).getSeconds() % 60;
            return minutes + " min " + seconds + " seg";
        }
        return "N/A";
    }
}