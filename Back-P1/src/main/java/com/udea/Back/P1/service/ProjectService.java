package com.udea.Back.P1.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Map;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpHeaders;


import com.udea.Back.P1.dto.ProjectRequestDTO;
import com.udea.Back.P1.dto.ProjectResponseDTO;
import com.udea.Back.P1.entity.ProjectEntity;
import com.udea.Back.P1.entity.ProjectTeamsEntity;
import com.udea.Back.P1.entity.TechnologyEntity;
import com.udea.Back.P1.entity.UserEntity;
import com.udea.Back.P1.repository.*;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final CourseRepository courseRepository;
    private final SemesterRepository semesterRepository;
    private final TechnologyRepository technologyRepository;
    private final ProjectTypeRepository projectTypeRepository;
    private final ProjectStateRepository projectStateRepository;
    private final UserRepository userRepository;
    private final ProjectTeamsRepository projectTeamsRepository;

    public ProjectService(ProjectRepository projectRepository, CourseRepository courseRepository,
            SemesterRepository semesterRepository, ProjectTypeRepository projectTypeRepository,
            ProjectStateRepository projectStateRepository, TechnologyRepository technologyRepository,
            UserRepository userRepository, ProjectTeamsRepository projectTeamsRepository) {  // ← agregar aquí
        this.projectRepository = projectRepository;
        this.courseRepository = courseRepository;
        this.semesterRepository = semesterRepository;
        this.technologyRepository = technologyRepository;
        this.projectTypeRepository = projectTypeRepository;
        this.projectStateRepository = projectStateRepository;
        this.userRepository = userRepository;
        this.projectTeamsRepository = projectTeamsRepository;  // ← y aquí
    }

    @Transactional(readOnly = true)
    public Optional<ProjectResponseDTO> getActiveProjectForStudent(String userEmail) {
        if (userEmail == null || userEmail.isBlank()) {
            return Optional.empty();
        }

        return projectRepository
                .findActiveProjectForStudent(userEmail, LocalDate.now())
                .map(this::mapToDto);
    }

    public ProjectEntity createProject(ProjectRequestDTO dto) {
        ProjectEntity p = new ProjectEntity();
        p.setName(dto.getName());
        p.setDescription(dto.getDescription());
        p.setRepoUrl(dto.getRepoUrl());
        p.setCourse(courseRepository.findById(dto.getCourseId()).orElseThrow());
        p.setSemester(semesterRepository.findById(dto.getSemesterId()).orElseThrow());
        p.setType(projectTypeRepository.findById(dto.getTypeId()).orElseThrow());
        p.setState(projectStateRepository.findById(dto.getStateId()).orElseThrow());
        p.setTutor(userRepository.findById(dto.getTutorId()).orElseThrow());
        if (dto.getTechnologyIds() != null) {
            p.setTechnologies(technologyRepository.findAllById(dto.getTechnologyIds()));
        }

        ProjectEntity saved = projectRepository.save(p);

        // 1. Asociar al creador por email
        UserEntity creator = null;
        if (dto.getUserEmail() != null && !dto.getUserEmail().isBlank()) {
            creator = userRepository.findByEmail(dto.getUserEmail());
            if (creator != null) {
                addToTeam(saved, creator);
            }
        }

        // 2. Asociar colaboradores (sin token, repo público)
        if (dto.getRepoFullName() != null && !dto.getRepoFullName().isBlank() && creator != null) {
            syncCollaborators(saved, dto.getRepoFullName(), creator);
        }

        return saved;
    }

    private void syncCollaborators(ProjectEntity project, String repoFullName, UserEntity creator) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            String url = "https://api.github.com/repos/" + repoFullName + "/collaborators";

            HttpHeaders headers = new HttpHeaders();
            headers.set("Accept", "application/vnd.github+json");

            HttpEntity<Void> request = new HttpEntity<>(headers);

            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                request,
                new ParameterizedTypeReference<List<Map<String, Object>>>() {}
            );

            if (response.getBody() == null) return;

            for (Map<String, Object> collab : response.getBody()) {
                String login = (String) collab.get("login");
                if (login == null) continue;

                UserEntity collaborator = userRepository.findByGithubUsername(login);
                if (collaborator == null) continue;

                boolean alreadyAdded = project.getTeam().stream()
                    .anyMatch(t -> t.getStudent().getId().equals(collaborator.getId()));

                if (!alreadyAdded) {
                    addToTeam(project, collaborator);
                }
            }

        } catch (Exception e) {
            System.err.println("No se pudieron sincronizar colaboradores: " + e.getMessage());
        }
    }

    private void addToTeam(ProjectEntity project, UserEntity student) {
        ProjectTeamsEntity team = new ProjectTeamsEntity();
        team.setProject(project);
        team.setStudent(student);
        projectTeamsRepository.save(team);
    }

    private ProjectResponseDTO mapToDto(ProjectEntity project) {
        ProjectResponseDTO dto = new ProjectResponseDTO();
        dto.setId(project.getId());
        dto.setName(project.getName());
        dto.setDescription(project.getDescription());
        dto.setRepoUrl(project.getRepoUrl());
        dto.setManifestUrl(project.getManifestUrl());
        dto.setCourseName(project.getCourse() != null ? project.getCourse().getName() : null);
        dto.setSemesterName(project.getSemester() != null ? project.getSemester().getName() : null);
        dto.setTypeName(project.getType() != null ? project.getType().getName() : null);
        dto.setStateName(project.getState() != null ? project.getState().getName() : null);
        dto.setTutorName(project.getTutor() != null ? project.getTutor().getName() : null);
        dto.setTutorEmail(project.getTutor() != null ? project.getTutor().getEmail() : null);

        if (project.getSemester() != null && project.getSemester().getFechaFin() != null) {
            LocalDate submissionDate = project.getSemester().getFechaFin().minusDays(21);
            LocalDate today = LocalDate.now();

            dto.setSubmissionDate(submissionDate);

            boolean isAvailable = today.isEqual(submissionDate) || today.isAfter(submissionDate);
            dto.setIsSubmissionAvailable(isAvailable);
        } else {
            dto.setSubmissionDate(null);
            dto.setIsSubmissionAvailable(false);
        }

        List<String> technologyNames = project.getTechnologies().stream()
                .map(TechnologyEntity::getName)
                .toList();
        dto.setTechnologies(technologyNames);

        List<String> studentNames = project.getTeam().stream()
                .map(ProjectTeamsEntity::getStudent)
                .map(student -> student.getName())
                .toList();
        dto.setStudentNames(studentNames);

        return dto;
    }

    @Transactional(readOnly = true)
    public java.util.List<ProjectResponseDTO> getAllProjectsDto() {
        return projectRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public java.util.Optional<ProjectResponseDTO> getProjectDtoById(Long id) {
        return projectRepository.findById(id).map(this::mapToDto);
    }
}