package com.udea.Back.P1.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.udea.Back.P1.entity.SemesterEntity;

@Repository
public interface SemesterRepository extends JpaRepository<SemesterEntity, Long> {
}
