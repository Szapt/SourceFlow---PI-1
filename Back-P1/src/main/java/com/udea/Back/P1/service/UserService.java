package com.udea.Back.P1.service;

import org.springframework.stereotype.Service;
import com.udea.Back.P1.repository.UserRepository;
import com.udea.Back.P1.entity.UserEntity;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserEntity saveUser(UserEntity user) {
        return userRepository.save(user);
    }

    public UserEntity findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}
