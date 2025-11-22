package com.example.KLTN.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RevenueSummaryDTO {
    private BigDecimal totalRevenue; // Tổng doanh thu (chỉ tính APPROVED)
    private BigDecimal pendingRevenue; // Doanh thu chờ duyệt
    private BigDecimal adminRevenue; // Doanh thu của admin (từ Admin_mount)
    private BigDecimal ownerRevenue; // Tổng doanh thu của owners (từ User_mount)
    private Integer totalTransactions; // Tổng số transactions
    private Integer approvedTransactions; // Số transactions đã duyệt
    private List<HotelRevenueDTO> hotelRevenues; // Doanh thu theo từng hotel (cho owner)
}

