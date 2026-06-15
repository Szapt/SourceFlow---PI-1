package com.udea.Back.P1.controller;

import com.udea.Back.P1.dto.ManifestRequest;
import com.udea.Back.P1.dto.ProjectRequestDTO;
import com.udea.Back.P1.entity.ProjectEntity;
import com.udea.Back.P1.repository.ProjectRepository;
import com.udea.Back.P1.repository.CourseRepository;
import com.udea.Back.P1.repository.SemesterRepository;
import com.udea.Back.P1.repository.TechnologyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

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
    private TechnologyRepository technologyRepository;

    @Autowired
    private com.udea.Back.P1.service.ProjectService projectService;

    @GetMapping
    public ResponseEntity<List<com.udea.Back.P1.dto.ProjectResponseDTO>> getAllProjects() {
        List<com.udea.Back.P1.dto.ProjectResponseDTO> projects = projectService.getAllProjectsDto();
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProjectById(@PathVariable Long id) {
        return projectService.getProjectDtoById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/lookup/courses")
    public ResponseEntity<?> getAllCourses() {
        return ResponseEntity.ok(courseRepository.findAll());
    }

    @GetMapping("/lookup/semesters")
    public ResponseEntity<?> getAllSemesters() {
        return ResponseEntity.ok(semesterRepository.findAll());
    }

    @GetMapping("/lookup/technologies")
    public ResponseEntity<?> getAllTechnologies() {
        return ResponseEntity.ok(technologyRepository.findAll());
    }

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

    @PostMapping("/upload")
    public ResponseEntity<?> uploadProject(@RequestBody ProjectRequestDTO dto) {
        ProjectEntity saved = projectService.createProject(dto);
        return ResponseEntity.status(201).body(Map.of("id", saved.getId()));
    }
}