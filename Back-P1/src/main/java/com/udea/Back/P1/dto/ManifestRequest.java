package com.udea.Back.P1.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ManifestRequest {

    @NotBlank(message = "La URL del repositorio es requerida")
    private String repoUrl;

    @NotBlank(message = "La URL del manifiesto es requerida")
    private String manifestUrl;

}