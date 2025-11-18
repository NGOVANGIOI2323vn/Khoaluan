package com.example.KLTN.Controller.Geocoding;

import com.example.KLTN.Entity.HotelEntity;
import com.example.KLTN.Repository.HotelRepository;
import com.example.KLTN.Service.GeocodingService;
import com.example.KLTN.dto.Apireponsi;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/geocoding/admin")
@RequiredArgsConstructor
@Slf4j
public class GeocodingAdminController {
    
    private final GeocodingService geocodingService;
    private final HotelRepository hotelRepository;
    
    /**
     * Geocode tất cả các khách sạn chưa có latitude/longitude
     */
    @PostMapping("/geocode-all-hotels")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Apireponsi<Map<String, Object>>> geocodeAllHotels() {
        try {
            List<HotelEntity> hotels = hotelRepository.findAll();
            int total = hotels.size();
            int success = 0;
            int failed = 0;
            int skipped = 0;
            
            Map<String, Object> result = new HashMap<>();
            List<Map<String, Object>> details = new java.util.ArrayList<>();
            
            for (HotelEntity hotel : hotels) {
                // Skip nếu đã có latitude và longitude
                if (hotel.getLatitude() != null && hotel.getLongitude() != null) {
                    skipped++;
                    continue;
                }
                
                try {
                    // Tạo địa chỉ đầy đủ: address + city + Vietnam
                    String fullAddress = hotel.getAddress();
                    if (hotel.getCity() != null && !hotel.getCity().isEmpty()) {
                        fullAddress += ", " + hotel.getCity();
                    }
                    fullAddress += ", Vietnam";
                    
                    log.info("Geocoding hotel: {} - {}", hotel.getName(), fullAddress);
                    
                    ResponseEntity<Apireponsi<GeocodingService.GeocodeResult>> geocodeResponse = 
                        geocodingService.geocodeAddress(fullAddress);
                    
                    if (geocodeResponse.getBody() != null && 
                        geocodeResponse.getBody().getData() != null) {
                        GeocodingService.GeocodeResult geocodeResult = geocodeResponse.getBody().getData();
                        
                        if ("OK".equals(geocodeResult.getStatus()) && 
                            geocodeResult.getLat() != null && 
                            geocodeResult.getLng() != null &&
                            geocodeResult.getLat() != 0.0 &&
                            geocodeResult.getLng() != 0.0) {
                            
                            hotel.setLatitude(geocodeResult.getLat());
                            hotel.setLongitude(geocodeResult.getLng());
                            hotelRepository.save(hotel);
                            
                            success++;
                            
                            Map<String, Object> detail = new HashMap<>();
                            detail.put("hotelId", hotel.getId());
                            detail.put("hotelName", hotel.getName());
                            detail.put("address", fullAddress);
                            detail.put("latitude", geocodeResult.getLat());
                            detail.put("longitude", geocodeResult.getLng());
                            detail.put("status", "SUCCESS");
                            details.add(detail);
                            
                            log.info("✅ Geocoded hotel {}: lat={}, lng={}", 
                                hotel.getName(), geocodeResult.getLat(), geocodeResult.getLng());
                            
                            // Delay để tránh rate limit của Google Maps API
                            Thread.sleep(100); // 100ms delay giữa các request
                        } else {
                            failed++;
                            Map<String, Object> detail = new HashMap<>();
                            detail.put("hotelId", hotel.getId());
                            detail.put("hotelName", hotel.getName());
                            detail.put("address", fullAddress);
                            detail.put("status", "FAILED");
                            detail.put("error", geocodeResult.getError() != null ? 
                                geocodeResult.getError() : "No results found");
                            details.add(detail);
                            
                            log.warn("❌ Failed to geocode hotel {}: {}", 
                                hotel.getName(), geocodeResult.getError());
                        }
                    } else {
                        failed++;
                        Map<String, Object> detail = new HashMap<>();
                        detail.put("hotelId", hotel.getId());
                        detail.put("hotelName", hotel.getName());
                        detail.put("address", fullAddress);
                        detail.put("status", "FAILED");
                        detail.put("error", "No response from geocoding service");
                        details.add(detail);
                    }
                } catch (Exception e) {
                    failed++;
                    Map<String, Object> detail = new HashMap<>();
                    detail.put("hotelId", hotel.getId());
                    detail.put("hotelName", hotel.getName());
                    detail.put("status", "FAILED");
                    detail.put("error", e.getMessage());
                    details.add(detail);
                    
                    log.error("❌ Error geocoding hotel {}: {}", hotel.getName(), e.getMessage());
                }
            }
            
            result.put("total", total);
            result.put("success", success);
            result.put("failed", failed);
            result.put("skipped", skipped);
            result.put("details", details);
            
            return ResponseEntity.ok(new Apireponsi<Map<String, Object>>(
                HttpStatus.OK,
                String.format("Geocoding completed: %d success, %d failed, %d skipped", 
                    success, failed, skipped),
                result,
                null
            ));
        } catch (Exception e) {
            log.error("Error in geocodeAllHotels: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(new Apireponsi<Map<String, Object>>(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Error geocoding hotels: " + e.getMessage(),
                null,
                e.getMessage()
            ));
        }
    }
    
    /**
     * Geocode một khách sạn cụ thể
     */
    @PostMapping("/geocode-hotel/{hotelId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public ResponseEntity<Apireponsi<Map<String, Object>>> geocodeHotel(@PathVariable Long hotelId) {
        try {
            HotelEntity hotel = hotelRepository.findById(hotelId).orElse(null);
            if (hotel == null) {
                return ResponseEntity.status(404).body(new Apireponsi<Map<String, Object>>(
                    HttpStatus.NOT_FOUND,
                    "Hotel not found",
                    null,
                    "Hotel with id " + hotelId + " not found"
                ));
            }
            
            // Tạo địa chỉ đầy đủ
            String fullAddress = hotel.getAddress();
            if (hotel.getCity() != null && !hotel.getCity().isEmpty()) {
                fullAddress += ", " + hotel.getCity();
            }
            fullAddress += ", Vietnam";
            
            log.info("Geocoding hotel: {} - {}", hotel.getName(), fullAddress);
            
            ResponseEntity<Apireponsi<GeocodingService.GeocodeResult>> geocodeResponse = 
                geocodingService.geocodeAddress(fullAddress);
            
            if (geocodeResponse.getBody() != null && 
                geocodeResponse.getBody().getData() != null) {
                GeocodingService.GeocodeResult geocodeResult = geocodeResponse.getBody().getData();
                
                if ("OK".equals(geocodeResult.getStatus()) && 
                    geocodeResult.getLat() != null && 
                    geocodeResult.getLng() != null &&
                    geocodeResult.getLat() != 0.0 &&
                    geocodeResult.getLng() != 0.0) {
                    
                    hotel.setLatitude(geocodeResult.getLat());
                    hotel.setLongitude(geocodeResult.getLng());
                    hotelRepository.save(hotel);
                    
                    Map<String, Object> result = new HashMap<>();
                    result.put("hotelId", hotel.getId());
                    result.put("hotelName", hotel.getName());
                    result.put("address", fullAddress);
                    result.put("latitude", geocodeResult.getLat());
                    result.put("longitude", geocodeResult.getLng());
                    result.put("formattedAddress", geocodeResult.getFormattedAddress());
                    result.put("status", "SUCCESS");
                    
                    return ResponseEntity.ok(new Apireponsi<Map<String, Object>>(
                        HttpStatus.OK,
                        "Hotel geocoded successfully",
                        result,
                        null
                    ));
                } else {
                    Map<String, Object> result = new HashMap<>();
                    result.put("hotelId", hotel.getId());
                    result.put("hotelName", hotel.getName());
                    result.put("address", fullAddress);
                    result.put("status", "FAILED");
                    result.put("error", geocodeResult.getError() != null ? 
                        geocodeResult.getError() : "No results found");
                    
                    return ResponseEntity.ok(new Apireponsi<Map<String, Object>>(
                        HttpStatus.OK,
                        "Geocoding failed",
                        result,
                        geocodeResult.getError()
                    ));
                }
            } else {
                return ResponseEntity.status(500).body(new Apireponsi<Map<String, Object>>(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "No response from geocoding service",
                    null,
                    "Geocoding service returned null"
                ));
            }
        } catch (Exception e) {
            log.error("Error geocoding hotel {}: {}", hotelId, e.getMessage(), e);
            return ResponseEntity.status(500).body(new Apireponsi<Map<String, Object>>(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Error geocoding hotel: " + e.getMessage(),
                null,
                e.getMessage()
            ));
        }
    }
}

