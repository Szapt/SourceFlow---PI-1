package com.udea.Back.P1.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.udea.Back.P1.entity.ProjectEntity;

@Repository
public interface ProjectRepository extends JpaRepository<ProjectEntity, Long> {
    
    Optional<ProjectEntity> findByRepoUrl(String repoUrl);
    Optional<ProjectEntity> findById(Long id);

}