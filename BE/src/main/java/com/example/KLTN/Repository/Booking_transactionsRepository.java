package com.example.KLTN.Repository;

import com.example.KLTN.Entity.Booking_transactionsEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface Booking_transactionsRepository extends JpaRepository<Booking_transactionsEntity, Long> {
    // Lấy transactions của owner (từ hotels của owner)
    @Query("SELECT t FROM Booking_transactionsEntity t " +
           "JOIN FETCH t.bookingEntity b " +
           "JOIN FETCH b.hotel h " +
           "WHERE h.owner.id = :ownerId")
    List<Booking_transactionsEntity> findByOwnerId(@Param("ownerId") Long ownerId);
}
