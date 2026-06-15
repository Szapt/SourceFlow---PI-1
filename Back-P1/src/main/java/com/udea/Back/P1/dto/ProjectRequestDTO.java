package com.udea.Back.P1.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectRequestDTO {
    private String name;
    private String description;
    private String repoUrl;
    private Long courseId;
    private Long semesterId;
    private Long typeId;
    private Long stateId;
    private Long tutorId;
    private List<Long> technologyIds; // Recibe los IDs de las tecnologías seleccionadas
    private String userEmail;
}