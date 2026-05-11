package com.udea.Back.P1.service;

import com.udea.Back.P1.dto.GitHubCommitDTO;
import com.udea.Back.P1.dto.GitHubReadmeDTO;
import com.udea.Back.P1.dto.GitHubRepoDTO;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

/**
 * Servicio que actúa como proxy autenticado hacia la API REST de GitHub.
 * <p>
 * Recibe el token OAuth del usuario en cada llamada (stateless) y lo reenvía
 * a la API de GitHub como {@code Authorization: Bearer <token>}.
 * <p>
 * Endpoints de GitHub utilizados:
 * <ul>
 *   <li>{@code GET /user/repos} — repos del usuario autenticado (incluye privados)</li>
 *   <li>{@code GET /repos/{owner}/{repo}} — detalle de un repo</li>
 *   <li>{@code GET /repos/{owner}/{repo}/languages} — lenguajes del repo</li>
 *   <li>{@code GET /repos/{owner}/{repo}/readme} — contenido README (base64)</li>
 *   <li>{@code GET /repos/{owner}/{repo}/commits} — últimos commits</li>
 * </ul>
 */
@Service
public class GitHubService {

    private final RestClient.Builder restClientBuilder;

    public GitHubService(RestClient.Builder restClientBuilder) {
        this.restClientBuilder = restClientBuilder;
    }

    /**
     * Lista los repositorios del usuario autenticado (incluye privados).
     * Ordena por último push y trae hasta 100 resultados.
     */
    public List<GitHubRepoDTO> listUserRepos(String token) {
        return buildClient(token)
                .get()
                .uri("/user/repos?per_page=100&sort=pushed&direction=desc")
                .retrieve()
                .onStatus(HttpStatusCode::isError, (request, response) -> {
                    throw new ResponseStatusException(response.getStatusCode(),
                            "Error al obtener repositorios de GitHub: " + response.getStatusCode());
                })
                .body(new ParameterizedTypeReference<List<GitHubRepoDTO>>() {});
    }

    /**
     * Obtiene el detalle de un repositorio específico.
     */
    public GitHubRepoDTO getRepo(String token, String owner, String repo) {
        return buildClient(token)
                .get()
                .uri("/repos/{owner}/{repo}", owner, repo)
                .retrieve()
                .onStatus(HttpStatusCode::isError, (request, response) -> {
                    throw new ResponseStatusException(response.getStatusCode(),
                            "Error al obtener repositorio " + owner + "/" + repo);
                })
                .body(GitHubRepoDTO.class);
    }

    /**
     * Obtiene los lenguajes utilizados en el repositorio.
     * Retorna un mapa {@code { "Java": 34567, "TypeScript": 12345 }}.
     */
    public Map<String, Long> getLanguages(String token, String owner, String repo) {
        return buildClient(token)
                .get()
                .uri("/repos/{owner}/{repo}/languages", owner, repo)
                .retrieve()
                .onStatus(HttpStatusCode::isError, (request, response) -> {
                    throw new ResponseStatusException(response.getStatusCode(),
                            "Error al obtener lenguajes de " + owner + "/" + repo);
                })
                .body(new ParameterizedTypeReference<Map<String, Long>>() {});
    }

    /**
     * Obtiene el contenido del README del repositorio (codificado en base64).
     */
    public GitHubReadmeDTO getReadme(String token, String owner, String repo) {
        return buildClient(token)
                .get()
                .uri("/repos/{owner}/{repo}/readme", owner, repo)
                .retrieve()
                .onStatus(HttpStatusCode::isError, (request, response) -> {
                    throw new ResponseStatusException(response.getStatusCode(),
                            "Error al obtener README de " + owner + "/" + repo);
                })
                .body(GitHubReadmeDTO.class);
    }

    /**
     * Obtiene los últimos 8 commits del repositorio.
     */
    public List<GitHubCommitDTO> getCommits(String token, String owner, String repo) {
        return buildClient(token)
                .get()
                .uri("/repos/{owner}/{repo}/commits?per_page=8", owner, repo)
                .retrieve()
                .onStatus(HttpStatusCode::isError, (request, response) -> {
                    throw new ResponseStatusException(response.getStatusCode(),
                            "Error al obtener commits de " + owner + "/" + repo);
                })
                .body(new ParameterizedTypeReference<List<GitHubCommitDTO>>() {});
    }

    /**
     * Construye un RestClient con el token del usuario inyectado.
     * Se crea una instancia nueva por request para mantener el modelo stateless.
     */
    private RestClient buildClient(String token) {
        return restClientBuilder
                .clone()
                .defaultHeader("Authorization", "Bearer " + token)
                .build();
    }
}
