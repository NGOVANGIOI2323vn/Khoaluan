package com.example.KLTN.Config;

import com.example.KLTN.Entity.HotelEntity;
import com.example.KLTN.Entity.HotelReviewEntity;
import com.example.KLTN.Service.HotelReviewService;
import com.example.KLTN.Service.HotelService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class Autocheck {
    private final HotelReviewService hotelReviewService;
    private final HotelService hotelService;

    @Scheduled(fixedRate = 60000)
    public void checkrating() {
        try {
            List<HotelEntity> listHotel = hotelService.findAllHotels();
            for (HotelEntity hotel : listHotel) {
                List<HotelReviewEntity> reviews = hotelReviewService.findHotelReviewById(hotel);
                if (reviews.isEmpty()) {
                    hotel.setRating(0);
                }
                else {
                    int tong = 0;
                    int dem = 0;
                    for (HotelReviewEntity r : reviews) {
                        if (r == null) continue; // bỏ qua review null
                        tong += r.getRating();
                        dem++;
                    }
                    if (dem == 0) {
                        hotel.setRating(0);
                    } else {
                        hotel.setRating(tong / dem);
                    }
                }
                hotelService.saveHotel(hotel); // lưu vào DB
            }
        } catch (Exception e) {
            System.err.println("Error in checkRating: " + e.getMessage());
        }
    }
}
