package com.example.KLTN.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class HotelFilterRequest {
    private String sortBy; // recommended, top_rated, price_high, price_low, most_stars, newest
    private Integer page = 0; // Page number (0-based)
    private Integer size = 8; // Page size
    private Integer minRating; // Minimum rating filter
    private Integer maxRating; // Maximum rating filter
    private Double minPrice; // Minimum price filter
    private Double maxPrice; // Maximum price filter
    private String search; // Search by name or address
    private String city; // Filter by city
    private LocalDate checkIn; // Check-in date
    private LocalDate checkOut; // Check-out date
    private Integer numberOfRooms; // Number of rooms needed
}

