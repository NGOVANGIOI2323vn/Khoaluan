package com.example.KLTN.Service.Impl;

import com.example.KLTN.Entity.BookingEntity;
import com.example.KLTN.dto.Apireponsi;
import com.example.KLTN.dto.BookingCreateDTO;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface BookingServiceImpl {
    void saveBooking(BookingEntity booking);

    BookingEntity findByid(Long id);

    ResponseEntity<Apireponsi<BookingEntity>> createBooking(Long id, BookingCreateDTO dto);

    ResponseEntity<Apireponsi<BookingEntity>> payBooking(Long id);

    ResponseEntity<Apireponsi<List<BookingEntity>>> getBookingHistoryByUser();
}
