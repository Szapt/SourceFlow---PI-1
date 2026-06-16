package com.udea.Back.P1.controller;

import java.security.Principal;
import java.util.List;
import java.util.Optional;

import com.udea.Back.P1.dto.ProjectResponseDTO;
import com.udea.Back.P1.dto.ProjectUpdateDTO;
import com.udea.Back.P1.dto.UserSummaryDTO;
import com.udea.Back.P1.repository.UserRepository;
import com.udea.Back.P1.service.ProjectService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class MyProjectController {

    private final ProjectService projectService;
    private final UserRepository userRepository;

    public MyProjectController(ProjectService projectService, UserRepository userRepository) {
        this.projectService = projectService;
        this.userRepository = userRepository;
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

    @PutMapping("/my-project")
    public ResponseEntity<?> updateMyProject(
            @RequestHeader(value = "X-User-Email", required = false) String userEmail,
            Principal principal,
            @RequestBody ProjectUpdateDTO dto) {
        String email = principal != null ? principal.getName() : userEmail;
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body("Email requerido");
        }

        Optional<ProjectResponseDTO> updated = projectService.updateMyProject(email, dto);
        return updated
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/my-project/users")
    public ResponseEntity<List<UserSummaryDTO>> getAllUsers() {
        List<UserSummaryDTO> users = userRepository.findAll().stream()
                .map(u -> new UserSummaryDTO(u.getId(), u.getName(), u.getEmail()))
                .toList();
        return ResponseEntity.ok(users);
    }
}
