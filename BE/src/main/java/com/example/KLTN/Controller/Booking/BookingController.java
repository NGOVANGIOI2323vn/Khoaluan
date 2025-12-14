package com.example.KLTN.Controller.Booking;

import com.example.KLTN.Entity.BookingEntity;
import com.example.KLTN.Service.BookingService;
import com.example.KLTN.dto.Apireponsi;
import com.example.KLTN.dto.BookingCreateDTO;
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
    public ResponseEntity<?> getBookingHistory(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size
    ) {
        // Nếu không có page/size, trả về tất cả (backward compatibility)
        if (page == null && size == null) {
        return bookingService.getBookingHistoryByUser();
        }
        // Nếu có page/size, trả về phân trang
        int validPage = page != null && page >= 0 ? page : 0;
        int validSize = size != null && size > 0 ? size : 8;
        return bookingService.getBookingHistoryByUserPaginated(validPage, validSize);
    }
    
    @GetMapping("/rooms/{roomId}")
    public ResponseEntity<Apireponsi<List<BookingEntity>>> getBookingsByRoom(@PathVariable Long roomId) {
        return bookingService.getBookingsByRoom(roomId);
    }
    
    @GetMapping("/rooms/{roomId}/min-checkin-time")
    public ResponseEntity<Apireponsi<java.util.Map<String, Object>>> getMinCheckInTime(
            @PathVariable Long roomId,
            @RequestParam("checkInDate") String checkInDateStr) {
        try {
            java.time.LocalDate checkInDate = java.time.LocalDate.parse(checkInDateStr);
            return bookingService.getMinCheckInTime(roomId, checkInDate);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new Apireponsi<>(
                org.springframework.http.HttpStatus.BAD_REQUEST,
                "Invalid date format. Use YYYY-MM-DD",
                null,
                "INVALID_DATE"
            ));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Apireponsi<BookingEntity>> getBookingById(@PathVariable Long id) {
        return bookingService.getBookingById(id);
    }
}
