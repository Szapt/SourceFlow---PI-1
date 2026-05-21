package com.udea.Back.P1.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "project_types")
@Data
public class ProjectTypeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", nullable = true)
    private String description;

}
