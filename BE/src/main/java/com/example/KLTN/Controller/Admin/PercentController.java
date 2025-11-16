package com.example.KLTN.Controller.Admin;

import com.example.KLTN.Service.AdminPercentService;
import com.example.KLTN.dto.Apireponsi;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.KLTN.Entity.adminPercentEntity;

@RestController
@RequestMapping("/api/admin/percent")
@RequiredArgsConstructor
public class PercentController {
    private final AdminPercentService adminPercentService;

    @PostMapping("/create")
    public ResponseEntity<Apireponsi<adminPercentEntity>> create(@RequestParam("percent") double percent) {
        return adminPercentService.create(percent);
    }

    @PutMapping("/update")
    public ResponseEntity<Apireponsi<adminPercentEntity>> update(@RequestParam("tree /F /A") double percent) {
        Long id = Long.parseLong("1");
        return adminPercentService.updateAdminPercent(id, percent);
    }

}
