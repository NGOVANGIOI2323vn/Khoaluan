package com.example.KLTN.Controller.hotel;

import com.example.KLTN.Entity.HotelEntity;
import com.example.KLTN.Service.HotelService;
import com.example.KLTN.Service.RoomsService;
import com.example.KLTN.dto.Apireponsi;
import com.example.KLTN.dto.updateHotelDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.KLTN.dto.hotelDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/hotels")
@RequiredArgsConstructor
public class HotelRequestController {

    private final HotelService hotelService;
    private final RoomsService roomsService;

    @PostMapping
    public ResponseEntity<Apireponsi<HotelEntity>> createHotel(@RequestPart("hotel") hotelDto dto,
                                                               @RequestPart("hotelImage") MultipartFile hotelImage,
                                                               @RequestPart("roomsImage") List<MultipartFile> roomsImage
    ) {
        return hotelService.createHotel(dto, hotelImage, roomsImage);
    }

    @GetMapping
    public ResponseEntity<?> findAllHotel(
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "8") Integer size,
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
        // Nếu có filter params, sử dụng filter endpoint
        if (sortBy != null || page != null || size != null || minRating != null || 
            maxRating != null || minPrice != null || maxPrice != null || search != null ||
            city != null || checkIn != null || checkOut != null || numberOfRooms != null) {
            com.example.KLTN.dto.HotelFilterRequest filterRequest = new com.example.KLTN.dto.HotelFilterRequest();
            filterRequest.setSortBy(sortBy);
            filterRequest.setPage(page);
            filterRequest.setSize(size);
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
        // Nếu không có filter, trả về tất cả
        return hotelService.findAllHotel();
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

