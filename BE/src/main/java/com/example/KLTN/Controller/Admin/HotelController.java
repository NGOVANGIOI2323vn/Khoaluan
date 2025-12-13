package com.example.KLTN.Controller.Admin;

import com.example.KLTN.Entity.HotelEntity;
import com.example.KLTN.Service.HotelService;
import com.example.KLTN.dto.Apireponsi;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/hotels")
@RequiredArgsConstructor
public class HotelController {
    private final HotelService hotelService;

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
     * Admin xóa hotel - CHỨC NĂNG ĐÃ BỊ VÔ HIỆU HÓA
     * Admin chỉ có thể xem và khóa hotel, không thể tạo/sửa/xóa
     * Phải đặt trước @GetMapping("/{id}") để tránh conflict
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Apireponsi<HotelEntity>> deleteHotel(@PathVariable Long id) {
        return ResponseEntity.badRequest().body(new Apireponsi<HotelEntity>(
            org.springframework.http.HttpStatus.BAD_REQUEST, 
            "Admin không thể xóa khách sạn. Chỉ có thể xem và khóa khi cần thiết.", 
            null, 
            "FORBIDDEN_OPERATION"
        ));
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
     * Admin khóa/mở khóa hotel
     */
    @PutMapping("/{id}/lock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Apireponsi<HotelEntity>> toggleLockHotel(@PathVariable Long id) {
        return hotelService.toggleLockHotel(id);
    }

    /**
     * Admin tạo hotel mới - CHỨC NĂNG ĐÃ BỊ VÔ HIỆU HÓA
     * Admin chỉ có thể xem và khóa hotel, không thể tạo/sửa/xóa
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Apireponsi<HotelEntity>> createHotel(HttpServletRequest request,
                                                               @RequestParam(required = false) Long ownerId) {
        return ResponseEntity.badRequest().body(new Apireponsi<HotelEntity>(
            org.springframework.http.HttpStatus.BAD_REQUEST, 
            "Admin không thể tạo khách sạn. Chỉ có thể xem và khóa khi cần thiết.", 
            null, 
            "FORBIDDEN_OPERATION"
        ));
        // Chức năng đã bị vô hiệu hóa
    }

    /**
     * Admin cập nhật hotel - CHỨC NĂNG ĐÃ BỊ VÔ HIỆU HÓA
     * Admin chỉ có thể xem và khóa hotel, không thể tạo/sửa/xóa
     */
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Apireponsi<HotelEntity>> updateHotel(@PathVariable Long id,
                                                                HttpServletRequest request,
                                                                @RequestParam(required = false) Long ownerId) {
        return ResponseEntity.badRequest().body(new Apireponsi<HotelEntity>(
            org.springframework.http.HttpStatus.BAD_REQUEST, 
            "Admin không thể cập nhật khách sạn. Chỉ có thể xem và khóa khi cần thiết.", 
            null, 
            "FORBIDDEN_OPERATION"
        ));
        // Chức năng đã bị vô hiệu hóa
    }

}

