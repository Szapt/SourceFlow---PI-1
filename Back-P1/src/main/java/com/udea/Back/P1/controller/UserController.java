package com.udea.Back.P1.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.udea.Back.P1.dto.UserLoginDTO;
import com.udea.Back.P1.entity.UserEntity;
import com.udea.Back.P1.service.AuthService;
import com.udea.Back.P1.service.UserService;

import jakarta.validation.Valid;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
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
}
