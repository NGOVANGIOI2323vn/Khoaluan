package com.example.KLTN.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "company_info")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class CompanyInfoEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String key; // 'mission', 'vision', 'founded', 'name'
    
    @Column(columnDefinition = "TEXT")
    private String value;
}

