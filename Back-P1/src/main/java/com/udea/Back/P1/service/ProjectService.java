package com.udea.Back.P1.service;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

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
import com.udea.Back.P1.dto.ProjectUpdateDTO;
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

        // Set local para evitar duplicados — NO depende de project.getTeam()
        Set<Long> insertedIds = new HashSet<>();

        // 1. Insertar al owner por email
        if (dto.getUserEmail() != null && !dto.getUserEmail().isBlank()) {
            UserEntity creator = userRepository.findByEmail(dto.getUserEmail());
            if (creator != null) {
                addToTeam(saved, creator);
                insertedIds.add(creator.getId());
                System.out.println("[createProject] ✅ Owner insertado: " + creator.getGithubUsername());
            }
        }

        // 2. Insertar contributors desde GitHub
        if (dto.getRepoFullName() != null && !dto.getRepoFullName().isBlank()) {
            syncCollaborators(saved, dto.getRepoFullName(), insertedIds);
        }

        return saved;
    }

    private void syncCollaborators(ProjectEntity project, String repoFullName, Set<Long> insertedIds) {
        try {
            RestTemplate restTemplate = new RestTemplate();

            // /contributors es público, no requiere token
            String url = "https://api.github.com/repos/" + repoFullName + "/contributors";

            HttpHeaders headers = new HttpHeaders();
            headers.set("Accept", "application/vnd.github+json");

            HttpEntity<Void> request = new HttpEntity<>(headers);

            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                request,
                new ParameterizedTypeReference<List<Map<String, Object>>>() {}
            );

            if (response.getBody() == null) {
                System.out.println("[syncCollaborators] GitHub no retornó contributors.");
                return;
            }

            System.out.println("[syncCollaborators] Contributors encontrados: " + response.getBody().size());

            for (Map<String, Object> collab : response.getBody()) {
                String login = (String) collab.get("login");
                if (login == null) continue;

                System.out.println("[syncCollaborators] Buscando en BD: " + login);

                UserEntity collaborator = userRepository.findByGithubUsername(login);

                if (collaborator == null) {
                    System.out.println("[syncCollaborators] ⚠️ No encontrado en BD: " + login);
                    continue;
                }

                // Chequeo contra Set local — no depende de JPA
                if (insertedIds.contains(collaborator.getId())) {
                    System.out.println("[syncCollaborators] Duplicado evitado: " + login);
                    continue;
                }

                addToTeam(project, collaborator);
                insertedIds.add(collaborator.getId());
                System.out.println("[syncCollaborators] ✅ Contributor insertado: " + login);
            }

        } catch (Exception e) {
            System.err.println("[syncCollaborators] Error: " + e.getMessage());
            e.printStackTrace();
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

        // Consulta directa a projects_teams JOIN Users para evitar lazy loading
        List<Object[]> teamRows = projectTeamsRepository.findStudentInfoByProjectId(project.getId());

        List<String> studentNames = teamRows.stream()
                .map(row -> (String) row[0])
                .toList();
        dto.setStudentNames(studentNames);

        List<String> studentEmails = teamRows.stream()
                .map(row -> (String) row[1])
                .toList();
        dto.setStudentEmails(studentEmails);

        return dto;
    }

    @Transactional
    public Optional<ProjectResponseDTO> updateMyProject(String userEmail, ProjectUpdateDTO dto) {
        if (userEmail == null || userEmail.isBlank()) {
            return Optional.empty();
        }

        Optional<ProjectEntity> found = projectRepository.findActiveProjectForStudent(userEmail, LocalDate.now());
        if (found.isEmpty()) {
            return Optional.empty();
        }

        ProjectEntity project = found.get();

        if (dto.getDescription() != null) {
            project.setDescription(dto.getDescription());
        }

        if (dto.getTechnologyIds() != null) {
            project.setTechnologies(technologyRepository.findAllById(dto.getTechnologyIds()));
        }

        if (dto.getAuthorEmails() != null) {
            projectTeamsRepository.deleteByProjectId(project.getId());
            projectTeamsRepository.flush();
            Set<Long> inserted = new HashSet<>();
            for (String email : dto.getAuthorEmails()) {
                UserEntity user = userRepository.findByEmail(email);
                if (user != null && !inserted.contains(user.getId())) {
                    addToTeam(project, user);
                    inserted.add(user.getId());
                }
            }
        }

        ProjectEntity saved = projectRepository.save(project);
        return Optional.of(mapToDto(saved));
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