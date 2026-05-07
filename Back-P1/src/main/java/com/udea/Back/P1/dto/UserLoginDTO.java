package com.udea.Back.P1.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UserLoginDTO {

    @NotBlank(message = "El correo es requerido")
    private String email;

    @NotBlank(message = "La contraseña es requerida")
    private String password;

}