package com.udea.Back.P1.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.udea.Back.P1.dto.OAuthUserDTO;
import com.udea.Back.P1.dto.UserLoginDTO;
import com.udea.Back.P1.dto.UserRegisterDTO;
import com.udea.Back.P1.entity.UserEntity;
import com.udea.Back.P1.service.AuthService;
import com.udea.Back.P1.service.UserService;

import jakarta.validation.Valid;

@RestController
public class UserController {

    private final UserService userService;
    private final AuthService authService;

    public UserController(UserService userService, AuthService authService) {
        this.userService = userService;
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody UserLoginDTO userLoginDTO) {
        boolean success = authService.login(userLoginDTO.getEmail(),
                userLoginDTO.getPassword());

        if (!success) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }

        UserEntity user = userService.findByEmail(userLoginDTO.getEmail());

        return ResponseEntity.ok(user);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody UserRegisterDTO dto) {
        UserEntity user = authService.register(
                dto.getEmail(),
                dto.getPassword(),
                dto.getName() != null ? dto.getName() : "User",
                "local", null, null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Email already in use");
        }

        return ResponseEntity.ok(user);
    }

    @PostMapping("/register/oauth")
    public ResponseEntity<?> registerOAuth(@RequestBody OAuthUserDTO dto) {
        UserEntity user = authService.register(
                dto.getEmail(),
                null,
                dto.getName(),
                dto.getProvider(),
                dto.getGithubName(),
                dto.getGithubToken());

        if (user == null) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Este correo ya está registrado con cuenta local");
        }

        return ResponseEntity.ok(user);
    }

}
