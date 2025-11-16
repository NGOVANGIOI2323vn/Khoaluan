package com.example.KLTN.Service.Impl;

import com.example.KLTN.Entity.adminPercentEntity;
import com.example.KLTN.dto.Apireponsi;
import org.springframework.http.ResponseEntity;

public interface AdminPercentServiceImpl {
    void saveAdminPercent(adminPercentEntity adminPercentEntity);

    ResponseEntity<Apireponsi<adminPercentEntity>> updateAdminPercent(Long id, double percent);

    ResponseEntity<Apireponsi<adminPercentEntity>> create(double percent);
    adminPercentEntity findAdminPercentById(Long id);
}
