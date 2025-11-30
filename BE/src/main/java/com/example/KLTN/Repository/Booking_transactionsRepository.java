package com.example.KLTN.Repository;

import com.example.KLTN.Entity.Booking_transactionsEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface Booking_transactionsRepository extends JpaRepository<Booking_transactionsEntity, Long> {
    // Lấy transactions của owner (từ hotels của owner)
    @Query("SELECT DISTINCT t FROM Booking_transactionsEntity t " +
           "JOIN FETCH t.bookingEntity b " +
           "LEFT JOIN FETCH b.hotel h " +
           "LEFT JOIN FETCH b.rooms r " +
           "LEFT JOIN FETCH b.user u " +
           "WHERE h.owner.id = :ownerId")
    List<Booking_transactionsEntity> findByOwnerId(@Param("ownerId") Long ownerId);
    
    // Tính tổng doanh thu của owner (từ User_mount, chỉ APPROVED)
    @Query("SELECT COALESCE(SUM(t.User_mount), 0) FROM Booking_transactionsEntity t " +
           "JOIN t.bookingEntity b " +
           "JOIN b.hotel h " +
           "WHERE h.owner.id = :ownerId AND t.status = 'APPROVED'")
    BigDecimal getTotalRevenueByOwnerId(@Param("ownerId") Long ownerId);
    
    // Tính tổng doanh thu chờ duyệt của owner
    @Query("SELECT COALESCE(SUM(t.User_mount), 0) FROM Booking_transactionsEntity t " +
           "JOIN t.bookingEntity b " +
           "JOIN b.hotel h " +
           "WHERE h.owner.id = :ownerId AND t.status = 'PENDING'")
    BigDecimal getPendingRevenueByOwnerId(@Param("ownerId") Long ownerId);
    
    // Tính doanh thu theo từng hotel của owner (chỉ APPROVED)
    @Query("SELECT h.id, h.name, COALESCE(SUM(t.User_mount), 0), COUNT(t.id) " +
           "FROM Booking_transactionsEntity t " +
           "JOIN t.bookingEntity b " +
           "JOIN b.hotel h " +
           "WHERE h.owner.id = :ownerId AND t.status = 'APPROVED' " +
           "GROUP BY h.id, h.name")
    List<Object[]> getRevenueByHotels(@Param("ownerId") Long ownerId);
    
    // Tính doanh thu chờ duyệt theo từng hotel của owner
    @Query("SELECT h.id, h.name, COALESCE(SUM(t.User_mount), 0), COUNT(t.id) " +
           "FROM Booking_transactionsEntity t " +
           "JOIN t.bookingEntity b " +
           "JOIN b.hotel h " +
           "WHERE h.owner.id = :ownerId AND t.status = 'PENDING' " +
           "GROUP BY h.id, h.name")
    List<Object[]> getPendingRevenueByHotels(@Param("ownerId") Long ownerId);
    
    // Tính tổng doanh thu của admin (từ Admin_mount, chỉ APPROVED)
    @Query("SELECT COALESCE(SUM(t.Admin_mount), 0) FROM Booking_transactionsEntity t " +
           "WHERE t.status = 'APPROVED'")
    BigDecimal getTotalAdminRevenue();
    
    // Tính tổng doanh thu chờ duyệt của admin
    @Query("SELECT COALESCE(SUM(t.Admin_mount), 0) FROM Booking_transactionsEntity t " +
           "WHERE t.status = 'PENDING'")
    BigDecimal getPendingAdminRevenue();
    
    // Tính tổng doanh thu của hệ thống (từ amount, chỉ APPROVED)
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Booking_transactionsEntity t " +
           "WHERE t.status = 'APPROVED'")
    BigDecimal getTotalSystemRevenue();
    
    // Lấy tất cả transactions với JOIN FETCH bookingEntity và hotel
    @Query("SELECT DISTINCT t FROM Booking_transactionsEntity t " +
           "LEFT JOIN FETCH t.bookingEntity b " +
           "LEFT JOIN FETCH b.hotel h " +
           "LEFT JOIN FETCH h.owner")
    List<Booking_transactionsEntity> findAllWithDetails();
}
