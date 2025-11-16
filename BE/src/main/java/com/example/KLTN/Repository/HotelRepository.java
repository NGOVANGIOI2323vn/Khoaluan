package com.example.KLTN.Repository;

import com.example.KLTN.Entity.HotelEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HotelRepository extends JpaRepository<HotelEntity, Long> {
    @Query("SELECT h FROM HotelEntity h WHERE  h.status <> :status")
    List<HotelEntity> findAllHotelsNotPending(@Param("status") HotelEntity.Status status);

    @Query("SELECT h FROM HotelEntity h WHERE h.id = :id AND h.status <> :status")
    HotelEntity findByIdNotPending(@Param("id") Long id, @Param("status") HotelEntity.Status status);
}
