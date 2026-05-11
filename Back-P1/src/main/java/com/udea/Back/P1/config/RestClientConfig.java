package com.udea.Back.P1.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

/**
 * Configura un RestClient.Builder preconfigurado para la API de GitHub.
 * Los métodos del servicio agregan el token de autenticación por request.
 */
@Configuration
public class RestClientConfig {

    @Bean
    public RestClient.Builder githubRestClientBuilder() {
        return RestClient.builder()
                .baseUrl("https://api.github.com")
                .defaultHeader("Accept", "application/vnd.github.v3+json")
                .defaultHeader("X-GitHub-Api-Version", "2022-11-28");
    }
}
