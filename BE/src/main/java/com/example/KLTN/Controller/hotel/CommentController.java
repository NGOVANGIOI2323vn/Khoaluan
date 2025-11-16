package com.example.KLTN.Controller.hotel;

import com.example.KLTN.Entity.HotelReviewEntity;
import com.example.KLTN.Service.HotelReviewService;
import com.example.KLTN.dto.Apireponsi;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hotel")
@RequiredArgsConstructor
public class CommentController {
    private final HotelReviewService hotelReviewService;

    @PostMapping("/ceateComment")
    public ResponseEntity<Apireponsi<HotelReviewEntity>> createComment(@RequestParam("id") Long id,
                                                                       @RequestParam("comment") String comment,
                                                                       @RequestParam("rating") int rating
    ) {
        return hotelReviewService.createHotelReview(id, rating, comment);
    }
}
