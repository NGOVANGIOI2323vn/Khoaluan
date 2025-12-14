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
    // Logic mới: Tính thời gian dọn phòng (11h-14h)
    // - Check-out trước 11h, check-in sau 14h
    // - Hai booking overlap nếu:
    //   1. Booking cũ check-out vào ngày X và booking mới check-in vào ngày X-1 (không OK)
    //   2. Booking cũ check-in vào ngày X và booking mới check-out vào ngày X (không OK)
    //   3. Booking cũ check-out vào ngày X và booking mới check-in vào ngày X (OK - có thời gian dọn phòng)
    // Logic: (checkInDate < checkOut) AND (checkOutDate > checkIn) 
    //        AND NOT (checkOutDate = checkIn) - cho phép check-in cùng ngày với check-out
    @Query("SELECT COUNT(b) FROM BookingEntity b WHERE b.rooms.id = :roomId " +
           "AND b.status IN ('PENDING', 'PAID') " +
           "AND b.checkInDate < :checkOut " +
           "AND b.checkOutDate > :checkIn " +
           "AND NOT (b.checkOutDate = :checkIn)")  // Cho phép check-in cùng ngày với check-out (có thời gian dọn phòng)
    Long countBookingsForRoomInDateRange(
        @Param("roomId") Long roomId,
        @Param("checkIn") LocalDate checkIn,
        @Param("checkOut") LocalDate checkOut
    );
    
    // Query để lấy danh sách room IDs đã bị book trong khoảng thời gian
    // Logic mới: Tính thời gian dọn phòng (11h-14h)
    // Cho phép check-in cùng ngày với check-out của booking khác
    @Query("SELECT DISTINCT b.rooms.id FROM BookingEntity b WHERE " +
           "b.status IN ('PENDING', 'PAID') " +
           "AND b.checkInDate < :checkOut " +
           "AND b.checkOutDate > :checkIn " +
           "AND NOT (b.checkOutDate = :checkIn)")  // Cho phép check-in cùng ngày với check-out
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
    
    // Query để đếm số booking của một room (chỉ tính PENDING và PAID)
    @Query("SELECT COUNT(b) FROM BookingEntity b WHERE b.rooms.id = :roomId " +
           "AND b.status IN ('PENDING', 'PAID')")
    Long countBookingsByRoomId(@Param("roomId") Long roomId);
    
    // Query để đếm số booking của một hotel (chỉ tính PENDING và PAID)
    @Query("SELECT COUNT(b) FROM BookingEntity b WHERE b.hotel.id = :hotelId " +
           "AND b.status IN ('PENDING', 'PAID')")
    Long countBookingsByHotelId(@Param("hotelId") Long hotelId);
    
    // Query để lấy bookings check-out vào ngày check-in (để tính thời gian dọn phòng)
    // Thời gian dọn phòng = checkOutTime + 2-3h
    @Query("SELECT b FROM BookingEntity b WHERE b.rooms.id = :roomId " +
           "AND b.status IN ('PENDING', 'PAID') " +
           "AND b.checkOutDate = :checkInDate")
    List<BookingEntity> findBookingsCheckOutOnCheckInDate(
        @Param("roomId") Long roomId,
        @Param("checkInDate") java.time.LocalDate checkInDate
    );
}
