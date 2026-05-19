package com.udea.Back.P1.controller;

import com.udea.Back.P1.dto.ManifestRequest;
import com.udea.Back.P1.entity.ProjectEntity;
import com.udea.Back.P1.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/projects")
public class ProjectController {

    @Autowired
    private ProjectRepository projectRepository;

    /**
     * GET /api/projects
     * Retorna todos los proyectos registrados en la base de datos.
     * Incluye el repo_url que el frontend usa para consultar la GitHub API.
     * Público — no requiere autenticación (ver SecurityConfig).
     */
    @GetMapping
    public ResponseEntity<List<ProjectEntity>> getAllProjects() {
        List<ProjectEntity> projects = projectRepository.findAll();
        return ResponseEntity.ok(projects);
    }

    /**
     * GET /api/projects/{id}
     * Retorna un proyecto individual por su ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getProjectById(@PathVariable Long id) {
        return projectRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // ── Endpoint existente ────────────────────────────────────────────────────

    @PostMapping("/update-manifest")
    public ResponseEntity<?> updateManifestUrl(@RequestBody ManifestRequest request) {
        return projectRepository.findByRepoUrl(request.getRepoUrl())
            .map(project -> {
                project.setManifestUrl(request.getManifestUrl());
                projectRepository.save(project);
                return ResponseEntity.ok("Enlace actualizado correctamente para: " + project.getName());
            })
            .orElse(ResponseEntity.status(404).body("Error: Repositorio no encontrado en SourceFlow"));
    }
}