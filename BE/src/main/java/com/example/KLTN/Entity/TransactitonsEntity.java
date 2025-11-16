package com.example.KLTN.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class TransactitonsEntity {
    public enum statustype {
        deposit, withdraw
    }

    public enum Status {
        pending, success, failed
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id", nullable = false)
    private WalletsEntity wallet;
    @Column(nullable = false)
    private BigDecimal amount;
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private statustype type;   // deposit, withdraw
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Status status; // pending, success, failed
    private String vnpTxnRef;   // Mã giao dịch VNPAY
    private String vnpOrderInfo; // Nội dung đơn hàng
    private LocalDateTime createdAt = LocalDateTime.now();
}
