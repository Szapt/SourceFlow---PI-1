package com.udea.Back.P1.controller;

import com.udea.Back.P1.dto.ManifestRequest;
import com.udea.Back.P1.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    @Autowired
    private ProjectRepository projectRepository;

    @PostMapping("/update-manifest")
    public ResponseEntity<?> updateManifestUrl(@RequestBody ManifestRequest request) {
        // 1. Buscamos el proyecto por la URL del repositorio de GitHub
        return projectRepository.findByRepoUrl(request.getRepoUrl())
            .map(project -> {
                // 2. Actualizamos solo el campo del enlace
                project.setManifestUrl(request.getManifestUrl());
                projectRepository.save(project);
                return ResponseEntity.ok("Enlace actualizado correctamente para: " + project.getName());
            })
            .orElse(ResponseEntity.status(404).body("Error: Repositorio no encontrado en SourceFlow"));
    }
}
