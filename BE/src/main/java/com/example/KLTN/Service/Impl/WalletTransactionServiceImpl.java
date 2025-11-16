package com.example.KLTN.Service.Impl;

import com.example.KLTN.Entity.UsersEntity;
import com.example.KLTN.Entity.WalletTransactionEntity;
import com.example.KLTN.dto.Apireponsi;
import org.springframework.http.ResponseEntity;

public interface WalletTransactionServiceImpl {
    void saveWalletTransaction(WalletTransactionEntity walletTransactionEntity) ;
   void CreateWalletTransactionUUser(UsersEntity user, double amount, String description, WalletTransactionEntity.TransactionType transactionType) ;
}
