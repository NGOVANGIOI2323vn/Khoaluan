package com.example.KLTN.dto;

import com.example.KLTN.Entity.HotelEntity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponseDTO {
    private String message;
    private List<HotelEntity> hotels;
}

