package com.udea.Back.P1.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.udea.Back.P1.dto.ProjectResponseDTO;
import com.udea.Back.P1.entity.ProjectEntity;
import com.udea.Back.P1.entity.ProjectTeamsEntity;
import com.udea.Back.P1.entity.TechnologyEntity;
import com.udea.Back.P1.repository.ProjectRepository;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
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
}
