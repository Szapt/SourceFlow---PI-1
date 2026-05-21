package com.udea.Back.P1.service;

import javax.management.relation.Role;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.udea.Back.P1.repository.RoleRepository;
import com.udea.Back.P1.repository.UserRepository;
import com.udea.Back.P1.entity.RoleEntity;
import com.udea.Back.P1.entity.UserEntity;

import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public AuthService(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
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
            return false;
        }

        if (user.getPassword() == null) {
            return false;
        }

        boolean passwordMatches = passwordEncoder.matches(password, user.getPassword());

        return passwordMatches;
    }

    public UserEntity register(String email, String password, String name, String provider, String githubName) {
        UserEntity existing = userRepository.findByEmail(email);

        if (existing != null) {
            if (provider.equals(existing.getProvider())) {
                return existing; // OAuth que ya existe, dejarlo pasar
            }
            return null; // conflicto de provider
        }

        RoleEntity defaultRole = roleRepository.findByName("student")
                .orElseThrow(() -> new RuntimeException("Rol por defecto no encontrado"));

        UserEntity newUser = new UserEntity();
        newUser.setEmail(email);
        newUser.setName(name != null ? name : "User");
        newUser.setPassword(password != null ? passwordEncoder.encode(password) : null);
        newUser.setProvider(provider);
        newUser.setRole(defaultRole);
        newUser.setGithubUsername(githubName);
        return userRepository.save(newUser);
    }

    public UserEntity findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

}
