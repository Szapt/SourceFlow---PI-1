package com.udea.Back.P1.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.udea.Back.P1.entity.UserEntity;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {

    UserEntity findByEmail(String email);

    UserEntity findByGithub_id(Long github_id);
    UserEntity findByEmailAndPassword(String email, String password);
}
