package com.example.KLTN.Service;

import com.example.KLTN.Config.HTTPstatus.HttpResponseUtil;
import com.example.KLTN.Entity.HotelEntity;
import com.example.KLTN.Entity.HotelReviewEntity;
import com.example.KLTN.Entity.UsersEntity;
import com.example.KLTN.Repository.HotelReviewRepository;
import com.example.KLTN.Service.Impl.HotelReviewServiceImpl;
import com.example.KLTN.dto.Apireponsi;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HotelReviewService implements HotelReviewServiceImpl {
    private final HotelReviewRepository hotelReviewRepository;
    private final HttpResponseUtil httpResponseUtil;
    private final HotelService hotelService;
    private final UserService userService;

    @Override
    public void saveHotelReview(HotelReviewEntity hotelReviewEntity) {
        hotelReviewRepository.save(hotelReviewEntity);
    }

    @Override
    public ResponseEntity<Apireponsi<HotelReviewEntity>> createHotelReview(Long id, int rating, String comment) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            UsersEntity user = userService.FindByUsername(username);
            if (user == null) {
                return httpResponseUtil.notFound("Null user ");
            }
            HotelEntity hotel = hotelService.findHotelById(id);
            if (hotel == null) {
                return httpResponseUtil.notFound("Null hotel ");
            }
            if (hotel.getStatus().equals(HotelEntity.Status.pending)) {
                return httpResponseUtil.notFound("Hotel Chưa được phép kinh doanh");
            }
            if (rating > 5 || rating < 1) {
                return httpResponseUtil.badRequest("Đánh giá sao chưa hợp lệ");
            }
            HotelReviewEntity hotelReviewEntity = new HotelReviewEntity();
            hotelReviewEntity.setHotel(hotel);
            hotelReviewEntity.setRating(rating);
            hotelReviewEntity.setComment(comment);
            hotelReviewEntity.setUser(user);
            this.saveHotelReview(hotelReviewEntity);
            return httpResponseUtil.created("Tạo Commen thành công ", hotelReviewEntity);

        } catch (Exception e) {
            return httpResponseUtil.error("Error", e);
        }
    }

    @Override
    public List<HotelReviewEntity> findHotelReviewById(HotelEntity hotel) {
        return hotelReviewRepository.findAllHotelReviews6(hotel);
    }



    @Override
    public ResponseEntity<Apireponsi<String>> deleteHotelReviewById(Long id) {
        return null;
    }

    @Override
    public ResponseEntity<Apireponsi<List<HotelReviewEntity>>> getReviewsByHotelId(Long hotelId) {
        try {
            HotelEntity hotel = hotelService.findHotelById(hotelId);
            if (hotel == null) {
                return httpResponseUtil.notFound("Hotel not found");
            }
            List<HotelReviewEntity> reviews = this.findHotelReviewById(hotel);
            return httpResponseUtil.ok("Get reviews by hotel ID success", reviews);
        } catch (Exception e) {
            return httpResponseUtil.error("Get reviews by hotel ID error", e);
        }
    }
}
