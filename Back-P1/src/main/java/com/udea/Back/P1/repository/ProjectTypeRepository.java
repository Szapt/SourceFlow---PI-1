package com.udea.Back.P1.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.udea.Back.P1.entity.ProjectTypeEntity;

public interface ProjectTypeRepository extends JpaRepository<ProjectTypeEntity, Long> {
}
