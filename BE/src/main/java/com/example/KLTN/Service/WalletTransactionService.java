package com.example.KLTN.Service;

import com.example.KLTN.Config.HTTPstatus.HttpResponseUtil;
import com.example.KLTN.Entity.UsersEntity;
import com.example.KLTN.Entity.WalletTransactionEntity;
import com.example.KLTN.Repository.WalletTransactionRepository;
import com.example.KLTN.Service.Impl.WalletTransactionServiceImpl;
import com.example.KLTN.dto.Apireponsi;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class WalletTransactionService implements WalletTransactionServiceImpl {
    @Override
    public void CreateWalletTransactionUUser(UsersEntity user, double amount, String description, WalletTransactionEntity.TransactionType transactionType) {
            WalletTransactionEntity walletTransactionEntity = new WalletTransactionEntity();
            walletTransactionEntity.setUser(user);
            walletTransactionEntity.setCreatedAt(LocalDateTime.now());
            walletTransactionEntity.setDescription(description);
            walletTransactionEntity.setAmount(amount);
            walletTransactionEntity.setType(transactionType);
            this.saveWalletTransaction(walletTransactionEntity);
    }

    private final WalletTransactionRepository walletTransactionRepository;
    private final HttpResponseUtil httpResponseUtil;


    @Override
    public void saveWalletTransaction(WalletTransactionEntity walletTransactionEntity) {
        walletTransactionRepository.save(walletTransactionEntity);
    }
}
