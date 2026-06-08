package com.udea.Back.P1.controller;

import com.udea.Back.P1.dto.ManifestRequest;
import com.udea.Back.P1.entity.ProjectEntity;
import com.udea.Back.P1.repository.ProjectRepository;
import com.udea.Back.P1.repository.CourseRepository;
import com.udea.Back.P1.repository.SemesterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/projects")
public class ProjectController {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private SemesterRepository semesterRepository;

    @Autowired
    private com.udea.Back.P1.service.ProjectService projectService;

    /**
     * GET /api/projects
     * Retorna todos los proyectos registrados en la base de datos.
     * Incluye el repo_url que el frontend usa para consultar la GitHub API.
     * Público — no requiere autenticación (ver SecurityConfig).
     */
    @GetMapping
    public ResponseEntity<List<com.udea.Back.P1.dto.ProjectResponseDTO>> getAllProjects() {
        List<com.udea.Back.P1.dto.ProjectResponseDTO> projects = projectService.getAllProjectsDto();
        return ResponseEntity.ok(projects);
    }

    /**
     * GET /projects/{id}
     * Retorna un proyecto individual por su ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getProjectById(@PathVariable Long id) {
        return projectService.getProjectDtoById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * GET /projects/lookup/courses
     * Retorna todos los cursos disponibles en la base de datos.
     */
    @GetMapping("/lookup/courses")
    public ResponseEntity<?> getAllCourses() {
        return ResponseEntity.ok(courseRepository.findAll());
    }

    /**
     * GET /projects/lookup/semesters
     * Retorna todos los semestres disponibles en la base de datos.
     */
    @GetMapping("/lookup/semesters")
    public ResponseEntity<?> getAllSemesters() {
        return ResponseEntity.ok(semesterRepository.findAll());
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