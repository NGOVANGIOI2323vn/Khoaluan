package com.example.KLTN.Controller.Admin;

import com.example.KLTN.Service.AdminUserService;
import com.example.KLTN.dto.Apireponsi;
import com.example.KLTN.Entity.UsersEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {
    private final AdminUserService adminUserService;

    /**
     * Lấy danh sách tất cả users, có thể filter theo role (USER, OWNER)
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Apireponsi<List<UsersEntity>>> getAllUsers(
            @RequestParam(required = false) String role) {
        return adminUserService.getAllUsers(role);
    }

    /**
     * Lấy thông tin user theo ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Apireponsi<UsersEntity>> getUserById(@PathVariable Long id) {
        return adminUserService.getUserById(id);
    }

    /**
     * Cập nhật role của user (chuyển từ USER sang OWNER hoặc ngược lại)
     */
    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Apireponsi<UsersEntity>> updateUserRole(
            @PathVariable Long id,
            @RequestParam String role) {
        return adminUserService.updateUserRole(id, role);
    }

    /**
     * Khóa/Mở khóa user
     */
    @PutMapping("/{id}/lock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Apireponsi<UsersEntity>> toggleLockUser(@PathVariable Long id) {
        return adminUserService.toggleLockUser(id);
    }

    /**
     * Lấy thống kê số lượng users theo role
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Apireponsi<Object>> getUserStats() {
        return adminUserService.getUserStats();
    }
}

