package com.udea.Back.P1.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectUpdateDTO {
    private String description;
    private List<Long> technologyIds;
    private List<String> authorEmails;
}
