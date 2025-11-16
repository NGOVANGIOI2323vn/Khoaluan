package com.example.KLTN.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "wallet_transaction")
@Data
@NoArgsConstructor
@AllArgsConstructor

public class WalletTransactionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Người dùng thực hiện giao dịch
    @ManyToOne
    @JoinColumn(name = "user_id")
    private UsersEntity user;

    // Loại giao dịch: NẠP TIỀN / THANH TOÁN
    @Enumerated(EnumType.STRING)
    private TransactionType type;

    // Số tiền giao dịch
    private double amount;

    // Mô tả chi tiết (ví dụ: "Thanh toán booking #12")
    private String description;

    // Thời gian giao dịch
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }

    public enum TransactionType {
        DEPOSIT,       // Nạp tiền
        PAYMENT       // Hoàn tiền
    }
}
