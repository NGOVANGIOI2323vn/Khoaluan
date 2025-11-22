package com.example.KLTN.Controller.Admin;

import com.example.KLTN.Entity.HotelEntity;
import com.example.KLTN.Service.HotelService;
import com.example.KLTN.dto.Apireponsi;
import lombok.RequiredArgsConstructor;
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
}

