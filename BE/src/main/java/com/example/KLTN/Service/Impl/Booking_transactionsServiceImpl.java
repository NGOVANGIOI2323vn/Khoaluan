package com.example.KLTN.Service.Impl;

import com.example.KLTN.Entity.BookingEntity;
import com.example.KLTN.Entity.Booking_transactionsEntity;
import com.example.KLTN.dto.Apireponsi;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface Booking_transactionsServiceImpl {
    void SaveBooking_transactions(Booking_transactionsEntity booking_transactionsEntity);

    ResponseEntity<Apireponsi<Booking_transactionsEntity>> findBooking_transactionsById(Long id);

    ResponseEntity<Apireponsi<List<Booking_transactionsEntity>>> findAllBooking_transactionsById();

    ResponseEntity<Apireponsi<Booking_transactionsEntity>> Create(BookingEntity booking);

    ResponseEntity<Apireponsi<Booking_transactionsEntity>> setSatus(Long id);
    Booking_transactionsEntity findById(Long id);

}
