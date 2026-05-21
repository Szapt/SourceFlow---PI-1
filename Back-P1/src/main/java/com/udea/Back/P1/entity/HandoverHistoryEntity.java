package com.udea.Back.P1.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "handover_history")
@Data
public class HandoverHistoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "team_id", nullable = false)
    private ProjectTeamsEntity team;

    @ManyToOne
    @JoinColumn(name = "tutor_id", nullable = false)
    private UserEntity tutor;

    @Column(name = "course", nullable = false)
    private Integer course;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "state", nullable = false)
    private Integer state;
}