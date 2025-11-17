package com.example.KLTN.Controller.Vnpay;

import com.example.KLTN.dto.Apireponsi;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.KLTN.Service.withdrawhistoryService;
import com.example.KLTN.dto.withDrawDTO;
import com.example.KLTN.Entity.withDrawHistoryEntity;

import java.util.List;

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
    public ResponseEntity<Apireponsi<List<withDrawHistoryEntity>>> getAllWithdraws() {
        return withdrawhistoryService.getAllWithdraws();
    }
    
    @GetMapping("/my-withdraws")
    public ResponseEntity<Apireponsi<List<withDrawHistoryEntity>>> getMyWithdraws() {
        return withdrawhistoryService.getMyWithdraws();
    }
}
