package com.udea.Back.P1.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HandoverHistoryResponseDTO {
    private Long id;
    private Long teamId;
    private String projectName;  // Obtenido a través de la relación del equipo
    private String tutorName;    // Nombre del tutor que recibió
    private Integer course;      // Nivel o número del curso
    private LocalDate date;
    private Integer state;       // Estado de la entrega
}
