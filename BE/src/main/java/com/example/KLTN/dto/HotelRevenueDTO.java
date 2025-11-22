package com.example.KLTN.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HotelRevenueDTO {
    private Long hotelId;
    private String hotelName;
    private BigDecimal totalRevenue; // Tổng doanh thu (chỉ tính APPROVED transactions)
    private BigDecimal pendingRevenue; // Doanh thu chờ duyệt
    private Integer totalBookings; // Tổng số booking
    private Integer approvedBookings; // Số booking đã duyệt
}

