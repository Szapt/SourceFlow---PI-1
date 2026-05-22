package com.udea.Back.P1.controller;

import java.security.Principal;
import java.util.Optional;

import com.udea.Back.P1.dto.ProjectResponseDTO;
import com.udea.Back.P1.service.ProjectService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MyProjectController {

    private final ProjectService projectService;

    public MyProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping("/my-project")
    public ResponseEntity<ProjectResponseDTO> getMyProject(
            @RequestHeader(value = "X-User-Email", required = false) String userEmail,
            Principal principal) {
        String email = principal != null ? principal.getName() : userEmail;
        if (email == null || email.isBlank()) {
            return ResponseEntity.ok(null);
        }

        Optional<ProjectResponseDTO> project = projectService.getActiveProjectForStudent(email);
        return ResponseEntity.ok(project.orElse(null));
    }
}
