package com.udea.Back.P1.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

/**
 * DTO para el contenido del README de un repositorio GitHub.
 * El campo {@code content} viene codificado en base64.
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class GitHubReadmeDTO {

    private String content;

    private String encoding;

    @JsonProperty("download_url")
    private String downloadUrl;
}
