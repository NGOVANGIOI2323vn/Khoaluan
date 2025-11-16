package com.example.KLTN.Repository;

import com.example.KLTN.Entity.HotelEntity;
import com.example.KLTN.Entity.HotelReviewEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.awt.print.Pageable;
import java.util.List;


@Repository
public interface HotelReviewRepository extends JpaRepository<HotelReviewEntity, Long> {
    @Query(value = "SELECT h FROM HotelReviewEntity h ORDER BY h.rating ASC")
    public List<HotelReviewEntity> findAllHotelReviews(Pageable pageable);

    @Query(value = "select h FROM  HotelReviewEntity h where h.rating =5")
    public List<HotelReviewEntity> findAllHotelReviews5();


    // Lấy review kèm user, tránh LazyInitializationException
    @Query("SELECT r FROM HotelReviewEntity r JOIN FETCH r.user WHERE r.hotel = :hotel")
    List<HotelReviewEntity> findAllHotelReviews6(@Param("hotel") HotelEntity hotel);
}
