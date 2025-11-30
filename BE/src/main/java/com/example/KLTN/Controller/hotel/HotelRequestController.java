package com.example.KLTN.Controller.hotel;

import com.example.KLTN.Entity.HotelEntity;
import com.example.KLTN.Service.HotelService;
import com.example.KLTN.Service.RoomsService;
import com.example.KLTN.dto.Apireponsi;
import com.example.KLTN.dto.updateHotelDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.KLTN.dto.hotelDto;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import jakarta.servlet.http.HttpServletRequest;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/hotels")
@RequiredArgsConstructor
public class HotelRequestController {

    private final HotelService hotelService;
    private final RoomsService roomsService;
    private final ObjectMapper objectMapper;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Apireponsi<HotelEntity>> createHotel(
            HttpServletRequest request
    ) {
        try {
            MultipartHttpServletRequest multipartRequest = (MultipartHttpServletRequest) request;
            
            // Lấy JSON string từ part "hotel"
            String hotelJson = null;
            MultipartFile hotelPart = multipartRequest.getFile("hotel");
            if (hotelPart != null && !hotelPart.isEmpty()) {
                hotelJson = new String(hotelPart.getBytes(), StandardCharsets.UTF_8);
            } else {
                // Thử lấy từ parameter
                String[] hotelParams = multipartRequest.getParameterValues("hotel");
                if (hotelParams != null && hotelParams.length > 0) {
                    hotelJson = hotelParams[0];
                }
            }
            
            if (hotelJson == null || hotelJson.isEmpty()) {
                return ResponseEntity.badRequest().body(new Apireponsi<HotelEntity>(
                    org.springframework.http.HttpStatus.BAD_REQUEST, 
                    "Hotel data is required", 
                    null, 
                    "MISSING_DATA"
                ));
            }
            
            // Parse JSON string thành hotelDto
            hotelDto dto = objectMapper.readValue(hotelJson, hotelDto.class);
            
            // Lấy các file images (nếu có)
            MultipartFile hotelImage = multipartRequest.getFile("hotelImage");
            List<MultipartFile> roomsImage = multipartRequest.getFiles("roomsImage");
            
            return hotelService.createHotel(dto, hotelImage, roomsImage);
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            e.printStackTrace();
            System.err.println("JSON Parse Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(new Apireponsi<HotelEntity>(
                org.springframework.http.HttpStatus.BAD_REQUEST, 
                "Lỗi parse JSON: " + e.getMessage(), 
                null, 
                "PARSE_ERROR"
            ));
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error creating hotel: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(new Apireponsi<HotelEntity>(
                org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR, 
                "Lỗi khi tạo khách sạn: " + e.getMessage(), 
                null, 
                "INTERNAL_ERROR"
            ));
        }
    }

    @GetMapping
    public ResponseEntity<?> findAllHotel(
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) Integer minRating,
            @RequestParam(required = false) Integer maxRating,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String checkIn,
            @RequestParam(required = false) String checkOut,
            @RequestParam(required = false) Integer numberOfRooms
    ) {
        // Luôn sử dụng filter endpoint để trả về HotelPageResponse nhất quán
        com.example.KLTN.dto.HotelFilterRequest filterRequest = new com.example.KLTN.dto.HotelFilterRequest();
        filterRequest.setSortBy(sortBy);
        // Nếu page/size không được truyền, dùng giá trị mặc định
        filterRequest.setPage(page != null ? page : 0);
        filterRequest.setSize(size != null ? size : Integer.MAX_VALUE); // Nếu không có size, trả về tất cả
        filterRequest.setMinRating(minRating);
        filterRequest.setMaxRating(maxRating);
        filterRequest.setMinPrice(minPrice);
        filterRequest.setMaxPrice(maxPrice);
        filterRequest.setSearch(search);
        filterRequest.setCity(city);
        if (checkIn != null && !checkIn.isEmpty()) {
            try {
                filterRequest.setCheckIn(java.time.LocalDate.parse(checkIn));
            } catch (Exception e) {
                // Ignore invalid date
            }
        }
        if (checkOut != null && !checkOut.isEmpty()) {
            try {
                filterRequest.setCheckOut(java.time.LocalDate.parse(checkOut));
            } catch (Exception e) {
                // Ignore invalid date
            }
        }
        filterRequest.setNumberOfRooms(numberOfRooms);
        return hotelService.findHotelsWithFilters(filterRequest);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Apireponsi<HotelEntity>> getHotelById(@PathVariable Long id) {
        return hotelService.getHotelById(id);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Apireponsi<HotelEntity>> update(@PathVariable Long id,
                                                          @RequestPart("hotel") updateHotelDto dto,
                                                          @RequestPart(value = "hotelImage", required = false) MultipartFile hotelImage) {
        return hotelService.Updatehotel(id, dto, hotelImage);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Apireponsi<HotelEntity>> delete(@PathVariable Long id) {
        return hotelService.softDeleteHotel(id);
    }
    
    @PutMapping("/{id}/discount")
    public ResponseEntity<Apireponsi<HotelEntity>> setDiscountPercent(@PathVariable("id") Long id,
                                                                      @RequestParam("discount_percent") double discount_percent) {
        return roomsService.updateAlldiscount_percent(id, discount_percent);
    }
    
    @GetMapping("/{id}/rooms")
    public ResponseEntity<Apireponsi<List<com.example.KLTN.Entity.RoomsEntity>>> getRoomsByHotelId(@PathVariable Long id) {
        return roomsService.getRoomsByHotelId(id);
    }
    
    @GetMapping("/owner/my-hotels")
    public ResponseEntity<Apireponsi<List<HotelEntity>>> getMyHotels() {
        return hotelService.getMyHotels();
    }
}

