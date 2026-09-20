package com.katamid.backend.evaluation.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.katamid.backend.assessment.model.Question;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "candidate_answers")
@Getter
@Setter
public class CandidateAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_assessment_id", nullable = false)
    @JsonIgnore
    private CandidateAssessment candidateAssessment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    @JsonIgnore
    private Question question;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String submittedCode;

    private Integer passedTests = 0;

    private Integer scoreObtained = 0;
}