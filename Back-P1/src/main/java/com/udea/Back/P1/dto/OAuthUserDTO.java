package com.udea.Back.P1.dto;

import lombok.Data;

@Data
public class OAuthUserDTO {
    private String email;
    private String name;
    private String provider;
    private String githubName;
    private String githubToken;
    
}
