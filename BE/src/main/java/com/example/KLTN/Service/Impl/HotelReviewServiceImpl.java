package com.example.KLTN.Service.Impl;

import com.example.KLTN.Entity.HotelEntity;
import com.example.KLTN.Entity.HotelReviewEntity;
import com.example.KLTN.dto.Apireponsi;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface HotelReviewServiceImpl {
    void saveHotelReview(HotelReviewEntity hotelReviewEntity);

    ResponseEntity<Apireponsi<HotelReviewEntity>> createHotelReview(Long id, int rating, String comment);

    List<HotelReviewEntity>findHotelReviewById(HotelEntity hotel);

//    ResponseEntity<Apireponsi<List<HotelReviewEntity>>> findAllHotelReviewByHotel(Long id_hotel);

    ResponseEntity<Apireponsi<String>> deleteHotelReviewById(Long id);

    ResponseEntity<Apireponsi<List<HotelReviewEntity>>> getReviewsByHotelId(Long hotelId);
}
      