package com.example.KLTN.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "WithDrawHistory")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class withDrawHistoryEntity {
    public enum Status {
        pending, resolved, refuse

    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Double amount;
    private String accountNumber;
    private String bankName;
    private LocalDateTime create_AT;
    private LocalDateTime update_AT;
    @Enumerated(EnumType.STRING)
    private Status status;
    private String accountHolderName;


    @ManyToOne
    @JoinColumn(name = "wallet_id", nullable = false)
    private WalletsEntity walletsEntity;

}
