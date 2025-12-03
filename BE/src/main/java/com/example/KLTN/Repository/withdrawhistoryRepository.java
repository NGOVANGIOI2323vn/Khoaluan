package com.example.KLTN.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.example.KLTN.Entity.withDrawHistoryEntity;

import java.util.List;

@Repository
public interface withdrawhistoryRepository extends JpaRepository<withDrawHistoryEntity,Long> {
    List<withDrawHistoryEntity> findByWalletsEntityId(Long walletId);
    Page<withDrawHistoryEntity> findByWalletsEntityIdOrderByIdDesc(Long walletId, Pageable pageable);

    // Lấy tất cả withdraws với pagination và search
    @Query("SELECT w FROM withDrawHistoryEntity w " +
           "LEFT JOIN FETCH w.walletsEntity wallet " +
           "LEFT JOIN FETCH wallet.user u " +
           "WHERE ((:search IS NULL OR :search = '') OR " +
           "       (:searchId IS NOT NULL AND w.id = :searchId) OR " +
           "       (w.accountHolderName IS NOT NULL AND LOWER(w.accountHolderName) LIKE LOWER(CONCAT('%', :search, '%'))) OR " +
           "       (w.accountNumber IS NOT NULL AND LOWER(w.accountNumber) LIKE LOWER(CONCAT('%', :search, '%'))) OR " +
           "       (w.bankName IS NOT NULL AND LOWER(w.bankName) LIKE LOWER(CONCAT('%', :search, '%'))) OR " +
           "       (u.username IS NOT NULL AND LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%'))) OR " +
           "       (u.email IS NOT NULL AND LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))) " +
           "ORDER BY w.id DESC")
    Page<withDrawHistoryEntity> findAllWithSearch(
            @Param("search") String search,
            @Param("searchId") Long searchId,
            Pageable pageable);
}
