package com.udea.Back.P1.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectResponseDTO {
    private Long id;
    private String name;
    private String description;
    private String repoUrl;
    private String manifestUrl;
    
    // Traemos los datos planos de las tablas maestras
    private String courseName;
    private String semesterName;
    private String typeName;
    private String stateName;
    
    // Datos del Tutor encargado
    private String tutorName;
    private String tutorEmail;

    // Fechas y disponibilidad de envío
    private LocalDate submissionDate;
    private Boolean isSubmissionAvailable;
    
    // Listas simplificadas para romper el bucle infinito
    private List<String> technologies; // Solo los nombres de las tecnologías ["React", "Java"]
    private List<String> studentNames; // Solo los nombres de los estudiantes del equipo
    private List<String> studentEmails; // Emails de los estudiantes del equipo
}
