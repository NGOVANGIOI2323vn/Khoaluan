package com.example.KLTN.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.KLTN.Entity.withDrawHistoryEntity;

import java.util.List;

@Repository
public interface withdrawhistoryRepository extends JpaRepository<withDrawHistoryEntity,Long> {
    List<withDrawHistoryEntity> findByWalletsEntityId(Long walletId);
    Page<withDrawHistoryEntity> findByWalletsEntityIdOrderByIdDesc(Long walletId, Pageable pageable);
}
