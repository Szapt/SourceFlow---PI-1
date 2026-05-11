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

        if (user.getPassword() == null) {
            System.out.println("El usuario intentó iniciar sesión con contraseña pero su cuenta es OAuth.");
            return false;
        }

        boolean passwordMatches = passwordEncoder.matches(password, user.getPassword());

        return passwordMatches;
    }

    public UserEntity register(String email, String password, String name, String provider) {
        UserEntity existing = userRepository.findByEmail(email);

        if (existing != null) {
            if (provider.equals(existing.getProvider())) {
                return existing; // OAuth que ya existe, dejarlo pasar
            }
            return null; // conflicto de provider
        }

        UserEntity newUser = new UserEntity();
        newUser.setEmail(email);
        newUser.setName(name != null ? name : "User");
        newUser.setPassword(password != null ? passwordEncoder.encode(password) : null);
        newUser.setProvider(provider);
        newUser.setRol(0);
        return userRepository.save(newUser);
    }

    public UserEntity findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

}
