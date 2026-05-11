package com.udea.Back.P1.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

/**
 * DTO que representa un commit de GitHub devuelto por la API REST.
 * Aplanado desde la estructura anidada de GitHub para facilitar consumo en frontend.
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class GitHubCommitDTO {

    private String sha;

    @JsonProperty("html_url")
    private String htmlUrl;

    private CommitDetail commit;

    private AuthorInfo author;

    /**
     * Detalle del commit (mensaje, autor, fecha).
     */
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CommitDetail {
        private String message;
        private CommitAuthor author;

        @Data
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class CommitAuthor {
            private String name;
            private String date;
        }
    }

    /**
     * Info del autor de GitHub (login, avatar).
     */
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class AuthorInfo {
        private String login;

        @JsonProperty("avatar_url")
        private String avatarUrl;
    }
}
