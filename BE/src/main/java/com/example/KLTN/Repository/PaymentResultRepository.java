package com.example.KLTN.Repository;

import com.example.KLTN.Entity.PaymentResultEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentResultRepository extends JpaRepository<PaymentResultEntity, Long> {
}
