package com.udea.Back.P1.dto;

import com.udea.Back.P1.entity.UserEntity;

public class AuthResponseDTO {
    private String token;
    private UserEntity user;

    public AuthResponseDTO(String token, UserEntity user) {
        this.token = token;
        this.user = user;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public UserEntity getUser() {
        return user;
    }

    public void setUser(UserEntity user) {
        this.user = user;
    }
}
