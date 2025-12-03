package com.example.KLTN.Controller.Vnpay;

import com.example.KLTN.dto.Apireponsi;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.example.KLTN.Service.withdrawhistoryService;
import com.example.KLTN.dto.withDrawDTO;
import com.example.KLTN.Entity.withDrawHistoryEntity;

@RestController
@RequestMapping("/api/withdraws")
@RequiredArgsConstructor
public class withdrawmoneyController {
    private final withdrawhistoryService withdrawhistoryService;

    @PostMapping
    public ResponseEntity<Apireponsi<withDrawHistoryEntity>> create(@RequestBody withDrawDTO dto) {
        return withdrawhistoryService.createWithdraw(dto);
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<Apireponsi<withDrawHistoryEntity>> approve(@PathVariable Long id) {
        return withdrawhistoryService.approveWithdraw(id);
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<Apireponsi<withDrawHistoryEntity>> reject(@PathVariable Long id) {
        return withdrawhistoryService.rejectWithdraw(id);
    }
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllWithdraws(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        // Nếu không có page/size, trả về tất cả (backward compatibility)
        if (page == null && size == null) {
            return withdrawhistoryService.getAllWithdraws();
        }
        // Nếu có page/size, trả về phân trang
        return withdrawhistoryService.getAllWithdrawsPaginated(search, page, size);
    }
    
    @GetMapping("/my-withdraws")
    public ResponseEntity<?> getMyWithdraws(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size
    ) {
        // Nếu không có page/size, trả về tất cả (backward compatibility)
        if (page == null && size == null) {
        return withdrawhistoryService.getMyWithdraws();
        }
        // Nếu có page/size, trả về phân trang
        int validPage = page != null && page >= 0 ? page : 0;
        int validSize = size != null && size > 0 ? size : 8;
        return withdrawhistoryService.getMyWithdrawsPaginated(validPage, validSize);
    }
}
