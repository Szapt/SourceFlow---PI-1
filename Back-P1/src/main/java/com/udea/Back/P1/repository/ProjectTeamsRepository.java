package com.udea.Back.P1.repository;

import com.udea.Back.P1.entity.ProjectTeamsEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectTeamsRepository extends JpaRepository<ProjectTeamsEntity, Long> {

    // Devuelve nombre y email de cada miembro del equipo consultando projects_teams por project_id
    @Query(value = """
        SELECT u.name, u.email
        FROM projects_teams pt
        JOIN Users u ON pt.student_id = u.id
        WHERE pt.project_id = :projectId
        """, nativeQuery = true)
    List<Object[]> findStudentInfoByProjectId(@Param("projectId") Long projectId);

    @Modifying
    @Query(value = "DELETE FROM projects_teams WHERE project_id = :projectId", nativeQuery = true)
    void deleteByProjectId(@Param("projectId") Long projectId);
}