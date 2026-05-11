package com.udea.Back.P1.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

/**
 * DTO que representa un repositorio de GitHub devuelto por la API REST.
 * Mapea los campos snake_case de GitHub a convenciones Java.
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class GitHubRepoDTO {

    private Long id;

    private String name;

    @JsonProperty("full_name")
    private String fullName;

    private String description;

    @JsonProperty("html_url")
    private String htmlUrl;

    @JsonProperty("private")
    private boolean isPrivate;

    @JsonProperty("default_branch")
    private String defaultBranch;

    private String language;

    @JsonProperty("stargazers_count")
    private int stargazersCount;

    @JsonProperty("forks_count")
    private int forksCount;

    @JsonProperty("open_issues_count")
    private int openIssuesCount;

    @JsonProperty("pushed_at")
    private String pushedAt;

    @JsonProperty("created_at")
    private String createdAt;

    @JsonProperty("updated_at")
    private String updatedAt;

    private GitHubLicenseDTO license;

    /**
     * Licencia embebida dentro del repo.
     */
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class GitHubLicenseDTO {
        private String name;

        @JsonProperty("spdx_id")
        private String spdxId;
    }
}
