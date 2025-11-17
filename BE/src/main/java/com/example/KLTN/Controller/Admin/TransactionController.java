package com.example.KLTN.Controller.Admin;

import com.example.KLTN.Entity.Booking_transactionsEntity;
import com.example.KLTN.Service.Booking_transactionsService;
import com.example.KLTN.dto.Apireponsi;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/transactions")
@RequiredArgsConstructor
public class TransactionController {
    private final Booking_transactionsService booking_transactionsService;

    @PutMapping("/{id}/approve")
    public ResponseEntity<Apireponsi<Booking_transactionsEntity>> approveTransaction(@PathVariable Long id) {
        return booking_transactionsService.setSatus(id);
    }

    @GetMapping
    public ResponseEntity<Apireponsi<List<Booking_transactionsEntity>>> getAllTransactions() {
        return booking_transactionsService.findAllBooking_transactionsById();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Apireponsi<Booking_transactionsEntity>> getTransaction(@PathVariable Long id) {
        return booking_transactionsService.findBooking_transactionsById(id);
    }
    
    @GetMapping("/owner/my-transactions")
    public ResponseEntity<Apireponsi<List<Booking_transactionsEntity>>> getMyTransactions() {
        return booking_transactionsService.getMyTransactions();
    }
}
