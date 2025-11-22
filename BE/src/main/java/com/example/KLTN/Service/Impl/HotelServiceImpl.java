package com.example.KLTN.Service.Impl;

import com.example.KLTN.Entity.HotelEntity;
import com.example.KLTN.dto.Apireponsi;
import com.example.KLTN.dto.updateHotelDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;
import com.example.KLTN.dto.hotelDto;

import java.util.List;

public interface HotelServiceImpl {
    void saveHotel(HotelEntity hotel);

    void deleteHotel(Long id);

    List<HotelEntity> findAllHotels();

    HotelEntity findHotelById(Long id);

    ResponseEntity<Apireponsi<HotelEntity>> createHotel(hotelDto dto,
                                                        MultipartFile hotelImage,
                                                        List<MultipartFile> roomsImage);

    ResponseEntity<Apireponsi<List<HotelEntity>>> findAllHotel();

    ResponseEntity<Apireponsi<HotelEntity>> Updatehotel(Long id, updateHotelDto dto,
                                                        MultipartFile hotelImage);

    ResponseEntity<Apireponsi<HotelEntity>> getHotelById(Long id);

    ResponseEntity<Apireponsi<HotelEntity>> softDeleteHotel(Long id);
    
    ResponseEntity<Apireponsi<com.example.KLTN.dto.HotelPageResponse>> findHotelsWithFilters(
        com.example.KLTN.dto.HotelFilterRequest filterRequest
    );
    
    // Admin methods
    ResponseEntity<Apireponsi<List<HotelEntity>>> getPendingHotels(String search);
    ResponseEntity<Apireponsi<HotelEntity>> approveHotel(Long id);
    ResponseEntity<Apireponsi<HotelEntity>> rejectHotel(Long id);
    ResponseEntity<Apireponsi<List<HotelEntity>>> getAllHotelsForAdmin(String search);
}

