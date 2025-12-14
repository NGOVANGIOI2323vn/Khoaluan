package com.example.KLTN.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingCreateDTO {
    private LocalDate checkInDate;
    private LocalTime checkInTime; // Giờ check-in (mặc định 14:00, user tự chọn)
    private LocalDate checkOutDate; // Ngày check-out (user tự chọn)
    private LocalTime checkOutTime; // Giờ check-out (user tự chọn, nhưng phải đảm bảo không quá 1 ngày)
}
