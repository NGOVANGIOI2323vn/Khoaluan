package com.example.KLTN.Controller.Booking;

import com.example.KLTN.Entity.BookingEntity;
import com.example.KLTN.Service.BookingService;
import com.example.KLTN.dto.Apireponsi;
import com.example.KLTN.dto.BookingCreateDTO;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping("/rooms/{roomId}")
    public ResponseEntity<Apireponsi<BookingEntity>> createBooking(@RequestBody BookingCreateDTO dto,
            @PathVariable("roomId") Long roomId) {
        return bookingService.createBooking(roomId, dto);
    }

    @PutMapping("/{id}/pay")
    public ResponseEntity<Apireponsi<BookingEntity>> payBooking(@PathVariable Long id) {
        return bookingService.payBooking(id);
    }

    @GetMapping
    public ResponseEntity<Apireponsi<List<BookingEntity>>> getBookingHistory() {
        return bookingService.getBookingHistoryByUser();
    }

    @GetMapping("/rooms/{roomId}")
    public ResponseEntity<Apireponsi<List<BookingEntity>>> getBookingsByRoom(@PathVariable Long roomId) {
        return bookingService.getBookingsByRoom(roomId);
    }

    // Tạo link thanh toán VNPAY
    @PostMapping("/pay/{bookingId}")
    public ResponseEntity<Apireponsi<String>> payBooking(@PathVariable Long bookingId, HttpServletRequest request) {
        return bookingService.payBookingViaVnpay(bookingId, request);
    }

    // Xử lý return từ VNPAY
    @GetMapping("/return")
    public ResponseEntity<Apireponsi<BookingEntity>> vnpayReturn(HttpServletRequest request) {
        return bookingService.handleVnpayReturn(request);
    }
}
