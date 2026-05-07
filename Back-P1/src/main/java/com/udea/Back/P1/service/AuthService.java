package com.udea.Back.P1.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.udea.Back.P1.repository.UserRepository;
import com.udea.Back.P1.entity.UserEntity;

import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public boolean login(String email, String password) {
        UserEntity user = null;
        try {
            user = userRepository.findByEmail(email);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
        if (user == null) {
            System.out.println("Correo no asociado a una cuenta " + email);
            return false;
        }

        boolean passwordMatches = passwordEncoder.matches(password, user.getPassword());

        return passwordMatches;
    }

    public UserEntity findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

}
