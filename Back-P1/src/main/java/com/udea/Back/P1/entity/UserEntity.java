package com.udea.Back.P1.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "users")
@Data
public class UserEntity {

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column
    @JsonIgnore
    private Long github_id;

    @Column
    @JsonIgnore
    private String github_username;

    @Column(nullable = false)
    @JsonIgnore
    private int rol;

}
