package com.example.KLTN.Controller.Admin;

import com.example.KLTN.Entity.HotelEntity;
import com.example.KLTN.Service.HotelService;
import com.example.KLTN.dto.Apireponsi;
import com.example.KLTN.dto.hotelDto;
import com.example.KLTN.dto.updateHotelDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import jakarta.servlet.http.HttpServletRequest;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/admin/hotels")
@RequiredArgsConstructor
public class HotelController {
    private final HotelService hotelService;
    private final ObjectMapper objectMapper;

    /**
     * Lấy danh sách tất cả hotels đang chờ duyệt (pending)
     */
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Apireponsi<List<HotelEntity>>> getPendingHotels(@RequestParam(required = false) String search) {
        return hotelService.getPendingHotels(search);
    }

    /**
     * Lấy danh sách hotels đang chờ duyệt với pagination
     */
    @GetMapping("/pending/paginated")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Apireponsi<com.example.KLTN.dto.PageResponse<HotelEntity>>> getPendingHotelsPaginated(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        return hotelService.getPendingHotelsPaginated(search, page, size);
    }

    /**
     * Duyệt hotel (chuyển status từ pending -> success)
     */
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Apireponsi<HotelEntity>> approveHotel(@PathVariable Long id) {
        return hotelService.approveHotel(id);
    }

    /**
     * Từ chối hotel (chuyển status từ pending -> fail)
     */
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Apireponsi<HotelEntity>> rejectHotel(@PathVariable Long id) {
        return hotelService.rejectHotel(id);
    }

    /**
     * Lấy tất cả hotels (bao gồm cả pending, success, fail) - chỉ admin
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Apireponsi<List<HotelEntity>>> getAllHotels(@RequestParam(required = false) String search) {
        return hotelService.getAllHotelsForAdmin(search);
    }

    /**
     * Lấy tất cả hotels với pagination - chỉ admin
     */
    @GetMapping("/paginated")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Apireponsi<com.example.KLTN.dto.PageResponse<HotelEntity>>> getAllHotelsPaginated(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        return hotelService.getAllHotelsForAdminPaginated(search, page, size);
    }

    /**
     * Admin xóa hotel (soft delete) - chỉ admin
     * Phải đặt trước @GetMapping("/{id}") để tránh conflict
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Apireponsi<HotelEntity>> deleteHotel(@PathVariable Long id) {
        return hotelService.deleteHotelForAdmin(id);
    }

    /**
     * Admin xem chi tiết hotel - chỉ admin (bao gồm cả pending)
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Apireponsi<HotelEntity>> getHotelById(@PathVariable Long id) {
        return hotelService.getHotelByIdForAdmin(id);
    }

    /**
     * Admin tạo hotel mới - chỉ admin
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Apireponsi<HotelEntity>> createHotel(HttpServletRequest request,
                                                               @RequestParam(required = false) Long ownerId) {
        try {
            MultipartHttpServletRequest multipartRequest = (MultipartHttpServletRequest) request;
            
            // Lấy JSON string từ part "hotel"
            String hotelJson = null;
            MultipartFile hotelPart = multipartRequest.getFile("hotel");
            if (hotelPart != null && !hotelPart.isEmpty()) {
                hotelJson = new String(hotelPart.getBytes(), StandardCharsets.UTF_8);
            } else {
                String[] hotelParams = multipartRequest.getParameterValues("hotel");
                if (hotelParams != null && hotelParams.length > 0) {
                    hotelJson = hotelParams[0];
                }
            }
            
            if (hotelJson == null || hotelJson.isEmpty()) {
                return ResponseEntity.badRequest().body(new Apireponsi<HotelEntity>(
                    org.springframework.http.HttpStatus.BAD_REQUEST, 
                    "Hotel data is required", 
                    null, 
                    "MISSING_DATA"
                ));
            }
            
            // Parse JSON string thành hotelDto
            hotelDto dto = objectMapper.readValue(hotelJson, hotelDto.class);
            
            // Lấy các file images (nếu có)
            MultipartFile hotelImage = multipartRequest.getFile("hotelImage");
            List<MultipartFile> roomsImage = multipartRequest.getFiles("roomsImage");
            
            return hotelService.createHotelForAdmin(dto, hotelImage, roomsImage, ownerId);
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(new Apireponsi<HotelEntity>(
                org.springframework.http.HttpStatus.BAD_REQUEST, 
                "Lỗi parse JSON: " + e.getMessage(), 
                null, 
                "PARSE_ERROR"
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(new Apireponsi<HotelEntity>(
                org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR, 
                "Lỗi khi tạo khách sạn: " + e.getMessage(), 
                null, 
                "INTERNAL_ERROR"
            ));
        }
    }

    /**
     * Admin cập nhật hotel - chỉ admin
     */
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Apireponsi<HotelEntity>> updateHotel(@PathVariable Long id,
                                                                HttpServletRequest request,
                                                                @RequestParam(required = false) Long ownerId) {
        try {
            MultipartHttpServletRequest multipartRequest = (MultipartHttpServletRequest) request;
            
            // Lấy JSON string từ part "hotel"
            String hotelJson = null;
            MultipartFile hotelPart = multipartRequest.getFile("hotel");
            if (hotelPart != null && !hotelPart.isEmpty()) {
                hotelJson = new String(hotelPart.getBytes(), StandardCharsets.UTF_8);
            } else {
                String[] hotelParams = multipartRequest.getParameterValues("hotel");
                if (hotelParams != null && hotelParams.length > 0) {
                    hotelJson = hotelParams[0];
                }
            }
            
            if (hotelJson == null || hotelJson.isEmpty()) {
                return ResponseEntity.badRequest().body(new Apireponsi<HotelEntity>(
                    org.springframework.http.HttpStatus.BAD_REQUEST, 
                    "Hotel data is required", 
                    null, 
                    "MISSING_DATA"
                ));
            }
            
            // Parse JSON string thành updateHotelDto
            updateHotelDto dto = objectMapper.readValue(hotelJson, updateHotelDto.class);
            
            // Lấy file image (nếu có)
            MultipartFile hotelImage = multipartRequest.getFile("hotelImage");
            
            return hotelService.updateHotelForAdmin(id, dto, hotelImage, ownerId);
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(new Apireponsi<HotelEntity>(
                org.springframework.http.HttpStatus.BAD_REQUEST, 
                "Lỗi parse JSON: " + e.getMessage(), 
                null, 
                "PARSE_ERROR"
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(new Apireponsi<HotelEntity>(
                org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR, 
                "Lỗi khi cập nhật khách sạn: " + e.getMessage(), 
                null, 
                "INTERNAL_ERROR"
            ));
        }
    }

}

