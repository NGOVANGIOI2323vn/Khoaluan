package com.example.KLTN.Repository;

import com.example.KLTN.Entity.OfficeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OfficeRepository extends JpaRepository<OfficeEntity, Long> {
    List<OfficeEntity> findAllByOrderByDisplayOrderAsc();
}

