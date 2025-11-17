package com.example.KLTN.Entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "booking")

@NoArgsConstructor
@AllArgsConstructor
@Data
public class BookingEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Enumerated(EnumType.STRING)
    private BookingStatus status;
    private LocalDateTime bookingDate;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private BigDecimal totalPrice;
    private String qrUrl;
    @ManyToOne
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "bookings", "wallet", "role"})
    @JoinColumn(name = "user_id")
    private UsersEntity user;
    @ManyToOne(fetch = FetchType.EAGER)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "rooms", "owner"})
    @JoinColumn(name = "hotel_id")
    private HotelEntity hotel;
    @ManyToOne(fetch = FetchType.EAGER)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "hotel"})
    @JoinColumn(name = "rooms_id")
    private RoomsEntity rooms;

    public enum BookingStatus {
        PENDING,     // Chờ thanh toán
        PAID,        // Đã thanh toán
        FAILED,      // Thanh toán thất bại
        REFUNDED     // Đã hoàn tiền (nếu hủy hoặc lỗi) thành
    }
}
