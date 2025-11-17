package com.example.KLTN.Service.Impl;

import com.example.KLTN.Entity.TransactitonsEntity;
import jakarta.servlet.http.HttpServletRequest;

public interface TransactitonsServiceImpl {
    void SaveTransactions(TransactitonsEntity transactitonsEntity);

    public void SucseccPayment(HttpServletRequest request);

    public void failedPayment(HttpServletRequest request);
}
