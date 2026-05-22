package com.udea.Back.P1.repository;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.udea.Back.P1.entity.ProjectEntity;

@Repository
public interface ProjectRepository extends JpaRepository<ProjectEntity, Long> {
    
    Optional<ProjectEntity> findByRepoUrl(String repoUrl);
    Optional<ProjectEntity> findById(Long id);

    @Query("""
        SELECT p FROM ProjectEntity p
        JOIN p.team t
        JOIN t.student s
        JOIN p.state st
        JOIN p.semester sem
        WHERE s.email = :email
          AND st.name = 'en progreso'
          AND sem.startDate <= :today
          AND sem.fechaFin >= :today
    """)
    Optional<ProjectEntity> findActiveProjectForStudent(
        @Param("email") String email,
        @Param("today") LocalDate today
    );

}