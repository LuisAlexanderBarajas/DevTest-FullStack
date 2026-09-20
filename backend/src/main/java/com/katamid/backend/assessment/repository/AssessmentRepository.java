package com.katamid.backend.assessment.repository;
import com.katamid.backend.assessment.model.Assessment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AssessmentRepository extends JpaRepository<Assessment, Long> {

    List<Assessment> findByIsActiveTrue();
}