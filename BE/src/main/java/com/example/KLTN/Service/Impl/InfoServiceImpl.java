package com.example.KLTN.Service.Impl;

import com.example.KLTN.Entity.*;
import com.example.KLTN.Repository.*;
import com.example.KLTN.Service.InfoService;
import com.example.KLTN.dto.Apireponsi;
import com.example.KLTN.dto.ContactMessageDTO;
import com.example.KLTN.Config.HTTPstatus.HttpResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class InfoServiceImpl implements InfoService {
    private final CompanyInfoRepository companyInfoRepository;
    private final FAQRepository faqRepository;
    private final ContactInfoRepository contactInfoRepository;
    private final OfficeRepository officeRepository;
    private final ContactMessageRepository contactMessageRepository;
    private final HttpResponseUtil httpResponseUtil;

    @Override
    public ResponseEntity<Apireponsi<Map<String, String>>> getCompanyInfo() {
        try {
            Map<String, String> info = new HashMap<>();
            companyInfoRepository.findAll().forEach(item -> {
                info.put(item.getKey(), item.getValue());
            });
            return httpResponseUtil.ok("Get company info success", info);
        } catch (Exception e) {
            return httpResponseUtil.error("Get company info error", e);
        }
    }

    @Override
    public ResponseEntity<Apireponsi<List<FAQEntity>>> getFAQs() {
        try {
            List<FAQEntity> faqs = faqRepository.findAllByOrderByDisplayOrderAsc();
            return httpResponseUtil.ok("Get FAQs success", faqs);
        } catch (Exception e) {
            return httpResponseUtil.error("Get FAQs error", e);
        }
    }

    @Override
    public ResponseEntity<Apireponsi<List<ContactInfoEntity>>> getContactInfo() {
        try {
            List<ContactInfoEntity> contactInfo = contactInfoRepository.findAllByOrderByDisplayOrderAsc();
            return httpResponseUtil.ok("Get contact info success", contactInfo);
        } catch (Exception e) {
            return httpResponseUtil.error("Get contact info error", e);
        }
    }

    @Override
    public ResponseEntity<Apireponsi<List<OfficeEntity>>> getOffices() {
        try {
            List<OfficeEntity> offices = officeRepository.findAllByOrderByDisplayOrderAsc();
            return httpResponseUtil.ok("Get offices success", offices);
        } catch (Exception e) {
            return httpResponseUtil.error("Get offices error", e);
        }
    }

    @Override
    public ResponseEntity<Apireponsi<ContactMessageEntity>> createContactMessage(ContactMessageDTO dto) {
        try {
            ContactMessageEntity message = new ContactMessageEntity();
            message.setName(dto.getName());
            message.setEmail(dto.getEmail());
            message.setPhone(dto.getPhone());
            message.setMessage(dto.getMessage());
            message.setCreatedAt(java.time.LocalDateTime.now());
            message.setIsRead(false);
            
            ContactMessageEntity saved = contactMessageRepository.save(message);
            return httpResponseUtil.created("Gửi tin nhắn thành công", saved);
        } catch (Exception e) {
            return httpResponseUtil.error("Create contact message error", e);
        }
    }
}

