package com.example.KLTN.Repository;

import com.example.KLTN.Entity.RoomsEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomsRepository extends JpaRepository<RoomsEntity,Long> {
    @Query("SELECT r FROM RoomsEntity r WHERE r.hotel.id = :hotelId AND r.deleted = false")
    List<RoomsEntity> findActiveRoomsByHotelId(@Param("hotelId") Long hotelId);

    @Query("SELECT r FROM RoomsEntity r WHERE r.hotel.id = :hotelId AND r.deleted = false")
    Page<RoomsEntity> findActiveRoomsByHotelId(@Param("hotelId") Long hotelId, Pageable pageable);

    @Query("SELECT r FROM RoomsEntity r WHERE r.id = :roomId AND r.deleted = false")
    Optional<RoomsEntity> findActiveRoomById(@Param("roomId") Long roomId);
}
