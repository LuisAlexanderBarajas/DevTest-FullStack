package com.katamid.backend.evaluation.repository;

import com.katamid.backend.evaluation.model.CandidateAssessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CandidateAssessmentRepository extends JpaRepository<CandidateAssessment, Long> {

    // Consulta para obtener el Podio / Ranking ordenado de mayor a menor puntaje
    @Query("SELECT ca FROM CandidateAssessment ca JOIN FETCH ca.user JOIN FETCH ca.assessment ORDER BY ca.totalScore DESC")
    List<CandidateAssessment> findAllOrderedByScoreDesc();

    // Historial de un usuario en específico
    List<CandidateAssessment> findByUserId(Long userId);

    List<CandidateAssessment> findByAssessmentIdAndStatusOrderByTotalScoreDesc(Long assessmentId, String status);

}