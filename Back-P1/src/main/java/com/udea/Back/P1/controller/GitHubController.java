package com.udea.Back.P1.controller;

import com.udea.Back.P1.dto.GitHubCommitDTO;
import com.udea.Back.P1.dto.GitHubReadmeDTO;
import com.udea.Back.P1.dto.GitHubRepoDTO;
import com.udea.Back.P1.service.GitHubService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller REST que expone la API de GitHub como proxy autenticado.
 * <p>
 * El frontend envía el token OAuth de GitHub en el header {@code Authorization}
 * y este controller lo reenvía al servicio que llama a la API de GitHub.
 * <p>
 * Endpoints:
 * <ul>
 *   <li>{@code GET /api/github/repos} — lista repos del usuario autenticado</li>
 *   <li>{@code GET /api/github/repos/{owner}/{repo}} — detalle de un repo</li>
 *   <li>{@code GET /api/github/repos/{owner}/{repo}/languages} — lenguajes</li>
 *   <li>{@code GET /api/github/repos/{owner}/{repo}/readme} — README</li>
 *   <li>{@code GET /api/github/repos/{owner}/{repo}/commits} — últimos commits</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/github")
public class GitHubController {

    private final GitHubService gitHubService;

    public GitHubController(GitHubService gitHubService) {
        this.gitHubService = gitHubService;
    }

    /**
     * Lista los repositorios del usuario autenticado en GitHub (incluye privados).
     */
    @GetMapping("/repos")
    public ResponseEntity<List<GitHubRepoDTO>> listUserRepos(
            @RequestHeader("Authorization") String authHeader) {
        String token = extractToken(authHeader);
        List<GitHubRepoDTO> repos = gitHubService.listUserRepos(token);
        return ResponseEntity.ok(repos);
    }

    /**
     * Obtiene el detalle de un repositorio específico.
     */
    @GetMapping("/repos/{owner}/{repo}")
    public ResponseEntity<GitHubRepoDTO> getRepo(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String owner,
            @PathVariable String repo) {
        String token = extractToken(authHeader);
        GitHubRepoDTO repoData = gitHubService.getRepo(token, owner, repo);
        return ResponseEntity.ok(repoData);
    }

    /**
     * Obtiene los lenguajes utilizados en un repositorio.
     */
    @GetMapping("/repos/{owner}/{repo}/languages")
    public ResponseEntity<Map<String, Long>> getLanguages(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String owner,
            @PathVariable String repo) {
        String token = extractToken(authHeader);
        Map<String, Long> languages = gitHubService.getLanguages(token, owner, repo);
        return ResponseEntity.ok(languages);
    }

    /**
     * Obtiene el contenido del README del repositorio.
     */
    @GetMapping("/repos/{owner}/{repo}/readme")
    public ResponseEntity<GitHubReadmeDTO> getReadme(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String owner,
            @PathVariable String repo) {
        String token = extractToken(authHeader);
        GitHubReadmeDTO readme = gitHubService.getReadme(token, owner, repo);
        return ResponseEntity.ok(readme);
    }

    /**
     * Obtiene los últimos commits del repositorio.
     */
    @GetMapping("/repos/{owner}/{repo}/commits")
    public ResponseEntity<List<GitHubCommitDTO>> getCommits(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String owner,
            @PathVariable String repo) {
        String token = extractToken(authHeader);
        List<GitHubCommitDTO> commits = gitHubService.getCommits(token, owner, repo);
        return ResponseEntity.ok(commits);
    }

    /**
     * Extrae el token del header Authorization.
     * Soporta formato "Bearer <token>" y token directo.
     */
    private String extractToken(String authHeader) {
        if (authHeader == null || authHeader.isBlank()) {
            throw new IllegalArgumentException("Se requiere el header Authorization con el token de GitHub");
        }
        if (authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return authHeader;
    }
}
