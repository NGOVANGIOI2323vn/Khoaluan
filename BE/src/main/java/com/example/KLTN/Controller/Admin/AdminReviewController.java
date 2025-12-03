package com.example.KLTN.Controller.Admin;

import com.example.KLTN.Service.AdminReviewService;
import com.example.KLTN.dto.Apireponsi;
import com.example.KLTN.dto.PageResponse;
import com.example.KLTN.Entity.HotelReviewEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/reviews")
@RequiredArgsConstructor
public class AdminReviewController {
    private final AdminReviewService adminReviewService;

    /**
     * Lấy danh sách reviews với search và pagination
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Apireponsi<PageResponse<HotelReviewEntity>>> getAllReviews(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        return adminReviewService.getAllReviews(search, page, size);
    }

    /**
     * Xóa review
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Apireponsi<String>> deleteReview(@PathVariable Long id) {
        return adminReviewService.deleteReview(id);
    }
}

