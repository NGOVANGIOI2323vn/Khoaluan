package com.example.KLTN.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class updateHotelDto {
    private String name;
    private String address;
    private String phone;
    private String description;
    private String imageUrl; // URL from Cloudinary (deprecated, use imageUrls instead)
    private List<String> imageUrls; // List of URLs from Cloudinary
    private Double latitude; // Vĩ độ
    private Double longitude; // Kinh độ
}
