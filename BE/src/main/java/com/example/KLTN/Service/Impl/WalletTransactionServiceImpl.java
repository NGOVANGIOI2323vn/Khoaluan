package com.example.KLTN.Service.Impl;

import com.example.KLTN.Entity.UsersEntity;
import com.example.KLTN.Entity.WalletTransactionEntity;

public interface WalletTransactionServiceImpl {
    void saveWalletTransaction(WalletTransactionEntity walletTransactionEntity) ;
   void CreateWalletTransactionUUser(UsersEntity user, double amount, String description, WalletTransactionEntity.TransactionType transactionType) ;
}
