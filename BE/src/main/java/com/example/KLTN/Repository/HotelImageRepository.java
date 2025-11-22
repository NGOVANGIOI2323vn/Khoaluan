package com.example.KLTN.Repository;

import com.example.KLTN.Entity.HotelImageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HotelImageRepository extends JpaRepository<HotelImageEntity, Long> {
    
    @Query("SELECT hi FROM HotelImageEntity hi WHERE hi.hotel.id = :hotelId AND hi.deleted = false ORDER BY hi.displayOrder ASC")
    List<HotelImageEntity> findActiveImagesByHotelId(@Param("hotelId") Long hotelId);
    
    @Query("SELECT hi FROM HotelImageEntity hi WHERE hi.id = :id AND hi.deleted = false")
    Optional<HotelImageEntity> findActiveImageById(@Param("id") Long id);
    
    void deleteByHotelId(Long hotelId);
}

