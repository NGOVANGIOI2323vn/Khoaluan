package com.example.KLTN.Repository;

import com.example.KLTN.Entity.HotelEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HotelRepository extends JpaRepository<HotelEntity, Long> {
    @Query("SELECT h FROM HotelEntity h WHERE h.status <> :status AND h.deleted = false")
    List<HotelEntity> findAllHotelsNotPending(@Param("status") HotelEntity.Status status);

    @Query("SELECT h FROM HotelEntity h WHERE h.status <> :status AND h.deleted = false")
    Page<HotelEntity> findAllHotelsNotPending(@Param("status") HotelEntity.Status status, Pageable pageable);

    @Query("SELECT h FROM HotelEntity h WHERE h.status <> :status AND h.deleted = false " +
           "AND (:minRating IS NULL OR h.rating >= :minRating) " +
           "AND (:maxRating IS NULL OR h.rating <= :maxRating) " +
           "AND (:city IS NULL OR LOWER(h.city) = LOWER(:city)) " +
           "AND (:search IS NULL OR LOWER(h.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(h.address) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<HotelEntity> findHotelsWithFilters(
        @Param("status") HotelEntity.Status status,
        @Param("minRating") Integer minRating,
        @Param("maxRating") Integer maxRating,
        @Param("city") String city,
        @Param("search") String search,
        Pageable pageable
    );

    @Query("SELECT h FROM HotelEntity h WHERE h.id = :id AND h.status <> :status AND h.deleted = false")
    HotelEntity findByIdNotPending(@Param("id") Long id, @Param("status") HotelEntity.Status status);
    
    // Query để lấy min price từ rooms của hotel (ưu tiên AVAILABLE, nếu không có thì lấy tất cả)
    @Query("SELECT MIN(r.price * (1 - COALESCE(r.discountPercent, 0))) FROM RoomsEntity r WHERE r.hotel.id = :hotelId AND r.deleted = false")
    Double findMinPriceByHotelId(@Param("hotelId") Long hotelId);
    
    // Query batch để lấy min price cho nhiều hotels cùng lúc
    @Query("SELECT r.hotel.id, MIN(r.price * (1 - COALESCE(r.discountPercent, 0))) FROM RoomsEntity r WHERE r.hotel.id IN :hotelIds AND r.deleted = false GROUP BY r.hotel.id")
    List<Object[]> findMinPricesByHotelIds(@Param("hotelIds") List<Long> hotelIds);
    
    // Query để lấy hotels của owner
    @Query("SELECT h FROM HotelEntity h WHERE h.owner.id = :ownerId AND h.deleted = false")
    List<HotelEntity> findByOwnerId(@Param("ownerId") Long ownerId);
    
    // Query để lấy hotels đang chờ duyệt (pending)
    @Query("SELECT h FROM HotelEntity h WHERE h.status = :status AND h.deleted = false")
    List<HotelEntity> findByStatus(@Param("status") HotelEntity.Status status);
    
    // Query để lấy hotels đang chờ duyệt với search
    @Query("SELECT h FROM HotelEntity h WHERE h.status = :status AND h.deleted = false " +
           "AND (:search IS NULL OR LOWER(h.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(h.address) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(h.city) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<HotelEntity> findByStatusWithSearch(@Param("status") HotelEntity.Status status, @Param("search") String search);
    
    // Query để lấy hotels đang chờ duyệt với pagination
    @Query("SELECT h FROM HotelEntity h WHERE h.status = :status AND h.deleted = false")
    Page<HotelEntity> findByStatusPageable(@Param("status") HotelEntity.Status status, Pageable pageable);
    
    // Query để lấy hotels đang chờ duyệt với search và pagination
    @Query("SELECT h FROM HotelEntity h WHERE h.status = :status AND h.deleted = false " +
           "AND (:search IS NULL OR LOWER(h.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(h.address) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(h.city) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<HotelEntity> findByStatusWithSearchPageable(@Param("status") HotelEntity.Status status, @Param("search") String search, Pageable pageable);
    
    // Query để lấy tất cả hotels với search - chỉ dùng cho admin
    @Query("SELECT h FROM HotelEntity h WHERE h.deleted = false " +
           "AND (:search IS NULL OR LOWER(h.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(h.address) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(h.city) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<HotelEntity> findAllNotDeletedWithSearch(@Param("search") String search);
    
    // Query để lấy tất cả hotels với search và pagination - chỉ dùng cho admin
    @Query("SELECT h FROM HotelEntity h WHERE h.deleted = false " +
           "AND (:search IS NULL OR LOWER(h.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(h.address) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(h.city) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<HotelEntity> findAllNotDeletedWithSearch(@Param("search") String search, Pageable pageable);
    
    // Query để lấy tất cả hotels (không filter status) - chỉ dùng cho admin
    @Query("SELECT h FROM HotelEntity h WHERE h.deleted = false")
    List<HotelEntity> findAllNotDeleted();
    
    // Query để lấy tất cả hotels với pagination - chỉ dùng cho admin
    @Query("SELECT h FROM HotelEntity h WHERE h.deleted = false")
    Page<HotelEntity> findAllNotDeleted(Pageable pageable);
    
    // Query để lấy hotels của owner với pagination
    @Query("SELECT h FROM HotelEntity h WHERE h.owner.id = :ownerId AND h.deleted = false")
    Page<HotelEntity> findByOwnerId(@Param("ownerId") Long ownerId, Pageable pageable);
}
