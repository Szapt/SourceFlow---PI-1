package com.udea.Back.P1.controller;

import org.springframework.web.bind.annotation.*;
import com.udea.Back.P1.service.UserService;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public UserEntity login(@RequestBody UserEntity user) {
        return userService.saveUser(user);
    }

}
