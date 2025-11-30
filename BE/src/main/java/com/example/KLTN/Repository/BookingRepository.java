package com.example.KLTN.Repository;

import com.example.KLTN.Entity.BookingEntity;
import com.example.KLTN.Entity.UsersEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface BookingRepository extends JpaRepository<BookingEntity, Long> {
    @Query("SELECT b FROM BookingEntity b " +
           "LEFT JOIN FETCH b.hotel " +
           "LEFT JOIN FETCH b.rooms " +
           "LEFT JOIN FETCH b.user " +
           "WHERE b.user = :user " +
           "ORDER BY b.bookingDate DESC")
    List<BookingEntity> findByUserOrderByBookingDateDesc(@Param("user") UsersEntity user);
    
    @Query("SELECT b FROM BookingEntity b " +
           "LEFT JOIN FETCH b.hotel " +
           "LEFT JOIN FETCH b.rooms " +
           "LEFT JOIN FETCH b.user " +
           "WHERE b.user = :user " +
           "ORDER BY b.bookingDate DESC")
    Page<BookingEntity> findByUserOrderByBookingDateDesc(@Param("user") UsersEntity user, Pageable pageable);
    
    // Query để check xem room có available trong khoảng thời gian không
    // Logic: Hai khoảng thời gian overlap nếu:
    // - checkIn của booking < checkOut của request VÀ checkOut của booking > checkIn của request
    @Query("SELECT COUNT(b) FROM BookingEntity b WHERE b.rooms.id = :roomId " +
           "AND b.status IN ('PENDING', 'PAID') " +
           "AND b.checkInDate < :checkOut " +
           "AND b.checkOutDate > :checkIn")
    Long countBookingsForRoomInDateRange(
        @Param("roomId") Long roomId,
        @Param("checkIn") LocalDate checkIn,
        @Param("checkOut") LocalDate checkOut
    );
    
    // Query để lấy danh sách room IDs đã bị book trong khoảng thời gian
    // Logic: Hai khoảng thời gian overlap nếu:
    // - checkIn của booking < checkOut của request VÀ checkOut của booking > checkIn của request
    @Query("SELECT DISTINCT b.rooms.id FROM BookingEntity b WHERE " +
           "b.status IN ('PENDING', 'PAID') " +
           "AND b.checkInDate < :checkOut " +
           "AND b.checkOutDate > :checkIn")
    List<Long> findBookedRoomIdsInDateRange(
        @Param("checkIn") LocalDate checkIn,
        @Param("checkOut") LocalDate checkOut
    );
    
    // Query để lấy bookings của một room
    @Query("SELECT b FROM BookingEntity b " +
           "LEFT JOIN FETCH b.user " +
           "WHERE b.rooms.id = :roomId " +
           "AND b.status IN ('PENDING', 'PAID') " +
           "ORDER BY b.checkInDate ASC")
    List<BookingEntity> findByRoomId(@Param("roomId") Long roomId);
}
