package com.example.KLTN.Repository;

import com.example.KLTN.Entity.ContactInfoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContactInfoRepository extends JpaRepository<ContactInfoEntity, Long> {
    List<ContactInfoEntity> findAllByOrderByDisplayOrderAsc();
}

