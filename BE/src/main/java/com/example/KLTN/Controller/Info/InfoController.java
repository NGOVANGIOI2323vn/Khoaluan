package com.example.KLTN.Controller.Info;

import com.example.KLTN.Service.InfoService;
import com.example.KLTN.dto.Apireponsi;
import com.example.KLTN.dto.ContactMessageDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/info")
@RequiredArgsConstructor
public class InfoController {
    private final InfoService infoService;

    @GetMapping("/company")
    public ResponseEntity<Apireponsi<Map<String, String>>> getCompanyInfo() {
        return infoService.getCompanyInfo();
    }

    @GetMapping("/faqs")
    public ResponseEntity<Apireponsi<List<com.example.KLTN.Entity.FAQEntity>>> getFAQs() {
        return infoService.getFAQs();
    }

    @GetMapping("/contact")
    public ResponseEntity<Apireponsi<List<com.example.KLTN.Entity.ContactInfoEntity>>> getContactInfo() {
        return infoService.getContactInfo();
    }

    @GetMapping("/offices")
    public ResponseEntity<Apireponsi<List<com.example.KLTN.Entity.OfficeEntity>>> getOffices() {
        return infoService.getOffices();
    }

    @PostMapping("/contact/message")
    public ResponseEntity<Apireponsi<com.example.KLTN.Entity.ContactMessageEntity>> createContactMessage(
            @RequestBody ContactMessageDTO dto) {
        return infoService.createContactMessage(dto);
    }
}

