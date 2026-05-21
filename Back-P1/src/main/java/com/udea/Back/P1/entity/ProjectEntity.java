package com.udea.Back.P1.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "Projects")
@Data
public class ProjectEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column (unique = true, nullable = false)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false, name = "repo_url")
    private String repoUrl;

    @Column(nullable = false)
    private Integer course;

    @Column(nullable = false)
    private Integer semester;

    @Column(nullable = false, name = "project_type")
    private Integer projectType;

    @Column(nullable = false)
    private Integer state;

    @Column(nullable = true, name = "manifest_url")
    private String manifestUrl;

    @Column(nullable = false)
    private Integer tutor;
}
