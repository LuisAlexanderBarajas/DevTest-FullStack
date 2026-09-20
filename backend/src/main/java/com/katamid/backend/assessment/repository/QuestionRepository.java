package com.katamid.backend.assessment.repository;
import com.katamid.backend.assessment.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuestionRepository extends JpaRepository<Question, Long> {}