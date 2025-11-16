package com.example.KLTN.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class updateHotelDto {
    private String name;
    private String address;
    private String phone;
    private String description;
}
