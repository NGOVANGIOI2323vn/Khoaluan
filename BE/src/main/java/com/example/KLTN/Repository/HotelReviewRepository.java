package com.example.KLTN.Repository;

import com.example.KLTN.Entity.HotelEntity;
import com.example.KLTN.Entity.HotelReviewEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface HotelReviewRepository extends JpaRepository<HotelReviewEntity, Long> {
    @Query(value = "SELECT h FROM HotelReviewEntity h ORDER BY h.rating ASC")
    public List<HotelReviewEntity> findAllHotelReviews(Pageable pageable);

    @Query(value = "select h FROM  HotelReviewEntity h where h.rating =5")
    public List<HotelReviewEntity> findAllHotelReviews5();


    // Lấy review kèm user, tránh LazyInitializationException, sắp xếp theo thời gian mới nhất
    @Query("SELECT r FROM HotelReviewEntity r JOIN FETCH r.user WHERE r.hotel = :hotel ORDER BY r.createdAt DESC")
    List<HotelReviewEntity> findAllHotelReviews6(@Param("hotel") HotelEntity hotel);

    // Query cho admin: lấy tất cả reviews với search và pagination
    @Query("SELECT r FROM HotelReviewEntity r " +
           "LEFT JOIN FETCH r.user u " +
           "LEFT JOIN FETCH r.hotel h " +
           "WHERE (:search IS NULL OR " +
           "       LOWER(r.comment) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "       LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "       LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "       LOWER(h.name) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY r.createdAt DESC")
    Page<HotelReviewEntity> findAllReviewsWithSearch(@Param("search") String search, Pageable pageable);
}
