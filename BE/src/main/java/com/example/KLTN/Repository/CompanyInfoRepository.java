package com.example.KLTN.Repository;

import com.example.KLTN.Entity.CompanyInfoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CompanyInfoRepository extends JpaRepository<CompanyInfoEntity, Long> {
    Optional<CompanyInfoEntity> findByKey(String key);
}

