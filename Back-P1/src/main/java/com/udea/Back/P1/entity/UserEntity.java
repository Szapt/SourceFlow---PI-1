package com.udea.Back.P1.entity;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "Users")
@Data
public class UserEntity {

    @Column(nullable = false)
    private String name;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(unique = true, nullable = false)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "github_id")
    @JsonIgnore
    private Long githubId;

    @Column(name = "github_username")
    @JsonIgnore
    private String githubUsername;

    @ManyToOne
    @JoinColumn(name = "role", nullable = true)
    private RoleEntity role;

    @Column(nullable = false)
    private String provider;

    @OneToMany(mappedBy = "student")
    @JsonIgnore
    private List<ProjectTeamsEntity> projects = new ArrayList<>();
}
