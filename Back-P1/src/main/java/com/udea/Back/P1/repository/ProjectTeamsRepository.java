package com.udea.Back.P1.repository;

import com.udea.Back.P1.entity.ProjectTeamsEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectTeamsRepository extends JpaRepository<ProjectTeamsEntity, Long> {
}