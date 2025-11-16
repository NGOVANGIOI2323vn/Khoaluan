package com.example.KLTN.Controller.Booking;

import com.example.KLTN.Entity.BookingEntity;
import com.example.KLTN.Service.BookingService;
import com.example.KLTN.dto.Apireponsi;
import com.example.KLTN.dto.BookingCreateDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/booking")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
//    private final String NGROK_PUBLIC_URL = "https://burly-daintily-etha.ngrok-free.dev";
    @PostMapping("create/{id}")
    public ResponseEntity<Apireponsi<BookingEntity>> createBooking(@RequestBody BookingCreateDTO dto,
                                                                   @PathVariable("id") Long id) {
        return bookingService.createBooking(id, dto);
    }

        @PutMapping("/pay/{id}")
    public ResponseEntity<Apireponsi<BookingEntity>> payBooking(@PathVariable Long id) {
        return bookingService.payBooking(id);
    }
}
