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

import com.udea.Back.P1.dto.AuthResponseDTO;
import com.udea.Back.P1.util.JwtUtil;

import jakarta.validation.Valid;

@RestController
public class UserController {

    private final UserService userService;
    private final AuthService authService;
    private final JwtUtil jwtUtil;

    public UserController(UserService userService, AuthService authService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.authService = authService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody UserLoginDTO userLoginDTO) {
        boolean success = authService.login(userLoginDTO.getEmail(),
                userLoginDTO.getPassword());

        if (!success) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }

        UserEntity user = userService.findByEmail(userLoginDTO.getEmail());
        String token = jwtUtil.generateToken(user.getEmail());

        return ResponseEntity.ok(new AuthResponseDTO(token, user));
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

        String token = jwtUtil.generateToken(user.getEmail());
        return ResponseEntity.ok(new AuthResponseDTO(token, user));
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

        String token = jwtUtil.generateToken(user.getEmail());
        return ResponseEntity.ok(new AuthResponseDTO(token, user));
    }

}
