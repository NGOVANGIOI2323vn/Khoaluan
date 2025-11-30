package com.example.KLTN.Entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "Users")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
@EqualsAndHashCode(exclude = {"wallet", "role"})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class UsersEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    @Builder.Default
    private boolean verified = false;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String phone;

    // Quan hệ N-1: nhiều user có thể thuộc 1 role
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id", nullable = false)
    private RoleEntity role;

    private LocalDateTime timeExpired;

    private String otp;

    // Quan hệ 1-1 với Wallet
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonManagedReference   // 👈 Quản lý đầu cha của mối quan hệ (tránh lặp)
    private WalletsEntity wallet;
}
