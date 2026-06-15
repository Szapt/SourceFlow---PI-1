package com.udea.Back.P1.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import com.udea.Back.P1.entity.TechnologyEntity;

public interface TechnologyRepository extends JpaRepository<TechnologyEntity, Long> {
    Optional<TechnologyEntity> findByName(String name);
}
