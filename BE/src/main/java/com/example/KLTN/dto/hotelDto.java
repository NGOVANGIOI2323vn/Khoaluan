package com.example.KLTN.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class hotelDto {
    private String name;
    private String address;
    private String phone;
    private String description;
    private List<roomsDto> rooms;
}