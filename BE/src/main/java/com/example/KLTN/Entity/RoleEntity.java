package com.example.KLTN.Entity;

import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "Roles")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class RoleEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = true)
    private String name;
}