package com.example.KLTN.Controller.Admin;

import com.example.KLTN.Entity.Booking_transactionsEntity;
import com.example.KLTN.Service.Booking_transactionsService;
import com.example.KLTN.dto.Apireponsi;
import com.example.KLTN.dto.RevenueSummaryDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/transactions")
@RequiredArgsConstructor
public class TransactionController {
    private final Booking_transactionsService booking_transactionsService;

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Apireponsi<Booking_transactionsEntity>> approveTransaction(@PathVariable Long id) {
        return booking_transactionsService.setSatus(id);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllTransactions(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        // Nếu không có page/size, trả về tất cả (backward compatibility)
        if (page == null && size == null) {
            return booking_transactionsService.findAllBooking_transactionsById();
        }
        // Nếu có page/size, trả về phân trang
        return booking_transactionsService.getAllTransactionsPaginated(search, page, size);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public ResponseEntity<Apireponsi<Booking_transactionsEntity>> getTransaction(@PathVariable Long id) {
        return booking_transactionsService.findBooking_transactionsById(id);
    }
    
    @GetMapping("/owner/my-transactions")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Apireponsi<List<Booking_transactionsEntity>>> getMyTransactions() {
        return booking_transactionsService.getMyTransactions();
    }
    
    @GetMapping("/revenue/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Apireponsi<RevenueSummaryDTO>> getAdminRevenue() {
        return booking_transactionsService.getAdminRevenue();
    }
    
    @GetMapping("/revenue/owner")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Apireponsi<RevenueSummaryDTO>> getOwnerRevenue() {
        return booking_transactionsService.getOwnerRevenue();
    }
}
