package com.example.KLTN.Repository;

import com.example.KLTN.Entity.WalletTransactionEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransactionEntity, Long> {
    List<WalletTransactionEntity> findByUserIdOrderByCreatedAtDesc(Long userId);
    Page<WalletTransactionEntity> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    Page<WalletTransactionEntity> findByUserIdAndTypeOrderByCreatedAtDesc(Long userId, WalletTransactionEntity.TransactionType type, Pageable pageable);
}