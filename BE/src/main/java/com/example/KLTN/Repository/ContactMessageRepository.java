package com.example.KLTN.Repository;

import com.example.KLTN.Entity.ContactMessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContactMessageRepository extends JpaRepository<ContactMessageEntity, Long> {
    List<ContactMessageEntity> findAllByOrderByCreatedAtDesc();
}

