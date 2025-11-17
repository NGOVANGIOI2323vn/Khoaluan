package com.example.KLTN.Repository;

import com.example.KLTN.Entity.FAQEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FAQRepository extends JpaRepository<FAQEntity, Long> {
    List<FAQEntity> findAllByOrderByDisplayOrderAsc();
}

