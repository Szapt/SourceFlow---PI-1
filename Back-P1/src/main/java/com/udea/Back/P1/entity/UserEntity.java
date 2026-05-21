package com.udea.Back.P1.entity;

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
    @Column (unique = true, nullable = false)
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

    @Column(nullable = false)
    @JsonIgnore
    private int rol;

    @Column(nullable = false)
    private String provider;

}
