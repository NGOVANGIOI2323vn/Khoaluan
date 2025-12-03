package com.example.KLTN.Service;

import com.example.KLTN.Config.HTTPstatus.HttpResponseUtil;
import com.example.KLTN.Entity.HotelReviewEntity;
import com.example.KLTN.Repository.HotelReviewRepository;
import com.example.KLTN.dto.Apireponsi;
import com.example.KLTN.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminReviewService {
    private final HotelReviewRepository hotelReviewRepository;
    private final HttpResponseUtil httpResponseUtil;

    /**
     * Lấy danh sách reviews với search và pagination
     */
    public ResponseEntity<Apireponsi<PageResponse<HotelReviewEntity>>> getAllReviews(
            String search, Integer page, Integer size) {
        try {
            // Set defaults
            int pageNumber = (page != null && page >= 0) ? page : 0;
            int pageSize = (size != null && size > 0) ? size : 10;

            // Tạo Pageable với sort theo createdAt DESC
            Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(Sort.Direction.DESC, "createdAt"));

            // Normalize search string
            String searchQuery = (search != null && !search.trim().isEmpty()) ? search.trim() : null;

            // Query với search
            Page<HotelReviewEntity> reviewPage = hotelReviewRepository.findAllReviewsWithSearch(searchQuery, pageable);

            // Convert to PageResponse
            PageResponse<HotelReviewEntity> pageResponse = new PageResponse<>(
                    reviewPage.getContent(),
                    reviewPage.getTotalPages(),
                    reviewPage.getTotalElements(),
                    reviewPage.getNumber(),
                    reviewPage.getSize(),
                    reviewPage.hasNext(),
                    reviewPage.hasPrevious()
            );

            return httpResponseUtil.ok("Lấy danh sách bình luận thành công", pageResponse);
        } catch (Exception e) {
            return httpResponseUtil.error("Lỗi khi lấy danh sách bình luận", e);
        }
    }

    /**
     * Xóa review theo ID
     */
    public ResponseEntity<Apireponsi<String>> deleteReview(Long id) {
        try {
            HotelReviewEntity review = hotelReviewRepository.findById(id).orElse(null);
            if (review == null) {
                return httpResponseUtil.notFound("Không tìm thấy bình luận với ID: " + id);
            }

            hotelReviewRepository.delete(review);
            return httpResponseUtil.ok("Xóa bình luận thành công", "Đã xóa bình luận ID: " + id);
        } catch (Exception e) {
            return httpResponseUtil.error("Lỗi khi xóa bình luận", e);
        }
    }
}

