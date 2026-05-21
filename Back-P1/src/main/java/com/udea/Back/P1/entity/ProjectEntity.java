package com.udea.Back.P1.entity;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "Projects")
@Data
public class ProjectEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(unique = true, nullable = false)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false, name = "repo_url")
    private String repoUrl;

    @ManyToOne
    @JoinColumn(name = "course", nullable = false)
    private CourseEntity course;

    @ManyToOne
    @JoinColumn(name = "semester", nullable = false)
    private SemesterEntity semester;

    @ManyToOne
    @JoinColumn(name = "project_type", nullable = false)
    private ProjectTypeEntity type;

    @ManyToOne
    @JoinColumn(name = "state", nullable = false)
    private ProjectStateEntity state;

    @Column(nullable = true, name = "manifest_url")
    private String manifestUrl;

    @ManyToOne
    @JoinColumn(name = "tutor", nullable = false)
    private UserEntity tutor;

    @OneToMany(mappedBy = "project")
    private List<ProjectTeamsEntity> team = new ArrayList<>();

    @ManyToMany
    @JoinTable(name = "projects_technologies", joinColumns = @JoinColumn(name = "project_id"), inverseJoinColumns = @JoinColumn(name = "technology_id"))
    private List<TechnologyEntity> technologies = new ArrayList<>();
}
