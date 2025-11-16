package com.example.KLTN.Entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "booking")

@NoArgsConstructor
@AllArgsConstructor
@Data
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
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
    @JsonBackReference
    @JoinColumn(name = "user_id")
    private UsersEntity user;
    @ManyToOne
    @JsonBackReference
    @JoinColumn(name = "hotel_id")
    private HotelEntity hotel;
    @ManyToOne
    @JsonBackReference
    @JoinColumn(name = "rooms_id")
    private RoomsEntity rooms;

    public enum BookingStatus {
        PENDING,     // Chờ thanh toán
        PAID,        // Đã thanh toán
        FAILED,      // Thanh toán thất bại
        REFUNDED     // Đã hoàn tiền (nếu hủy hoặc lỗi) thành
    }
}
