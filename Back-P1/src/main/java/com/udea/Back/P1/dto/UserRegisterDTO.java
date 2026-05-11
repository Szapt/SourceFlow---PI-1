package com.udea.Back.P1.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UserRegisterDTO {

    @NotBlank(message = "El correo es requerido")
    @Email(message = "El correo no es válido")
    private String email;

    @NotBlank(message = "La contraseña es requerida")
    private String password;

    private String name;
}
