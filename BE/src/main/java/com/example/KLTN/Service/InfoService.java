package com.example.KLTN.Service;

import com.example.KLTN.Entity.*;
import com.example.KLTN.dto.Apireponsi;
import com.example.KLTN.dto.ContactMessageDTO;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

public interface InfoService {
    ResponseEntity<Apireponsi<Map<String, String>>> getCompanyInfo();
    ResponseEntity<Apireponsi<List<FAQEntity>>> getFAQs();
    ResponseEntity<Apireponsi<List<ContactInfoEntity>>> getContactInfo();
    ResponseEntity<Apireponsi<List<OfficeEntity>>> getOffices();
    ResponseEntity<Apireponsi<ContactMessageEntity>> createContactMessage(ContactMessageDTO dto);
}

