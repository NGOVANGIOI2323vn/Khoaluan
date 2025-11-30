package com.example.KLTN.Repository;

import com.example.KLTN.Entity.BookingEntity;
import com.example.KLTN.Entity.UsersEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface BookingRepository extends JpaRepository<BookingEntity, Long> {

       // Lấy tất cả booking của user theo thứ tự
       @Query("SELECT b FROM BookingEntity b " +
                     "LEFT JOIN FETCH b.hotel " +
                     "LEFT JOIN FETCH b.rooms " +
                     "WHERE b.user = :user " +
                     "ORDER BY b.bookingDate DESC")
       List<BookingEntity> findByUserOrderByBookingDateDesc(@Param("user") UsersEntity user);

       // Kiểm tra xem phòng có trống trong khoảng thời gian (count)
       @Query("SELECT COUNT(b) FROM BookingEntity b " +
                     "WHERE b.rooms.id = :roomId " +
                     "AND b.status IN ('PENDING', 'PAID') " +
                     "AND b.checkInDate < :checkOut " +
                     "AND b.checkOutDate > :checkIn")
       Long countBookingsForRoomInDateRange(
                     @Param("roomId") Long roomId,
                     @Param("checkIn") LocalDate checkIn,
                     @Param("checkOut") LocalDate checkOut);

       // Lấy tất cả booking của room theo danh sách trạng thái
       List<BookingEntity> findByRoomsIdAndStatusIn(Long roomId, List<BookingEntity.BookingStatus> statuses);

       // Lấy danh sách roomId đã bị book trong khoảng thời gian
       @Query("SELECT DISTINCT b.rooms.id FROM BookingEntity b " +
                     "WHERE b.status IN ('PENDING', 'PAID') " +
                     "AND b.checkInDate < :checkOut " +
                     "AND b.checkOutDate > :checkIn")
       List<Long> findBookedRoomIdsInDateRange(
                     @Param("checkIn") LocalDate checkIn,
                     @Param("checkOut") LocalDate checkOut);

       // Lấy tất cả booking của 1 room
       @Query("SELECT b FROM BookingEntity b " +
                     "LEFT JOIN FETCH b.user " +
                     "WHERE b.rooms.id = :roomId " +
                     "AND b.status IN ('PENDING', 'PAID') " +
                     "ORDER BY b.checkInDate ASC")
       List<BookingEntity> findBookingsByRoomId(@Param("roomId") Long roomId);
}
