package com.example.KLTN.Controller.Admin;

import com.example.KLTN.Config.HTTPstatus.HttpResponseUtil;
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
    private final HttpResponseUtil httpResponseUtil;

    @PostMapping
    public ResponseEntity<Apireponsi<adminPercentEntity>> create(@RequestParam("percent") double percent) {
        return adminPercentService.create(percent);
    }

    @PutMapping
    public ResponseEntity<Apireponsi<adminPercentEntity>> update(@RequestParam("percent") double percent) {
        Long id = Long.parseLong("1");
        return adminPercentService.updateAdminPercent(id, percent);
    }

    @GetMapping
    public ResponseEntity<Apireponsi<adminPercentEntity>> get() {
        Long id = Long.parseLong("1");
        adminPercentEntity percent = adminPercentService.findAdminPercentById(id);
        if (percent == null) {
            return httpResponseUtil.notFound("Admin percent not found");
        }
        return httpResponseUtil.ok("Success", percent);
    }

}
