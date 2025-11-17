package com.example.KLTN.Controller.hotel;

import com.example.KLTN.Entity.HotelReviewEntity;
import com.example.KLTN.Service.HotelReviewService;
import com.example.KLTN.dto.Apireponsi;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hotels")
@RequiredArgsConstructor
public class CommentController {
    private final HotelReviewService hotelReviewService;

    @PostMapping("/{id}/reviews")
    public ResponseEntity<Apireponsi<HotelReviewEntity>> createReview(@PathVariable("id") Long id,
                                                                       @RequestParam("comment") String comment,
                                                                       @RequestParam("rating") int rating
    ) {
        return hotelReviewService.createHotelReview(id, rating, comment);
    }

    @GetMapping("/{id}/reviews")
    public ResponseEntity<Apireponsi<List<HotelReviewEntity>>> getReviewsByHotelId(@PathVariable Long id) {
        return hotelReviewService.getReviewsByHotelId(id);
    }
}
