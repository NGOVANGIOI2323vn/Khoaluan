package com.example.KLTN.Entity;


import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "payment_result")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResultEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    // Booking liên quan
    @ManyToOne
    @JoinColumn(name = "booking_id")
    private BookingEntity booking;
    // Tên khách sạn
    @ManyToOne
    @JoinColumn(name = "user_id")
    private UsersEntity user;
    private String hotelName;

    // Địa chỉ khách sạn
    private String hotelAddress;

    // Số phòng
    private String roomNumber;

    // Số người
    private int roomCapacity;

    // Thời gian check-in
    private LocalDate checkInDate;

    // Thời gian check-out
    private LocalDate checkOutDate;

    // Tổng tiền
    private BigDecimal totalPrice;




}
