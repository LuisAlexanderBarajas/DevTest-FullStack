package com.katamid.backend.assessment.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "assessments")
@Getter
@Setter
public class Assessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Integer timeLimitMinutes;

    @Column(nullable = false)
    private Integer questionCount;

    private Boolean isActive = true;
    
    @OneToMany(mappedBy = "assessment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Question> questions = new ArrayList<>();
}