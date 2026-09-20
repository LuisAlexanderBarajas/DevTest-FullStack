package com.katamid.backend.assessment.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "test_cases")
@Getter
@Setter
public class TestCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    @JsonIgnore
    private Question question;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String inputData;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String expectedOutput;

    @Column(nullable = false)
    private Boolean isHidden = false;
}