package com.example.KLTN.Repository;

import com.example.KLTN.Entity.Booking_transactionsEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface Booking_transactionsRepository extends JpaRepository<Booking_transactionsEntity, Long> {
}
