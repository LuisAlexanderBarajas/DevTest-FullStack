package com.katamid.backend.assessment.repository;
import com.katamid.backend.assessment.model.TestCase;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TestCaseRepository extends JpaRepository<TestCase, Long> {}