package com.example.KLTN.Repository;

import com.example.KLTN.Entity.adminPercentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminPercentRepository extends JpaRepository<adminPercentEntity, Long> {
}
