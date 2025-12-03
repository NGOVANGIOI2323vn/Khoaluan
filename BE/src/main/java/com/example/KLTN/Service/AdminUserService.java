package com.example.KLTN.Service;

import com.example.KLTN.Config.HTTPstatus.HttpResponseUtil;
import com.example.KLTN.Entity.RoleEntity;
import com.example.KLTN.Entity.UsersEntity;
import com.example.KLTN.Repository.RolesRepository;
import com.example.KLTN.Repository.UserRepository;
import com.example.KLTN.dto.Apireponsi;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminUserService {
    private final UserRepository userRepository;
    private final RolesRepository rolesRepository;
    private final HttpResponseUtil httpResponseUtil;

    /**
     * Lấy danh sách tất cả users, có thể filter theo role
     */
    public ResponseEntity<Apireponsi<List<UsersEntity>>> getAllUsers(String roleName) {
        try {
            List<UsersEntity> users;
            
            if (roleName != null && !roleName.isEmpty()) {
                // Filter theo role
                users = userRepository.findByRoleName(roleName);
            } else {
                // Lấy tất cả users
                users = (List<UsersEntity>) userRepository.findAll();
            }
            
            // Ẩn password trong response
            users.forEach(user -> user.setPassword(null));
            
            return httpResponseUtil.ok("Lấy danh sách users thành công", users);
        } catch (Exception e) {
            return httpResponseUtil.error("Lỗi khi lấy danh sách users", e);
        }
    }

    /**
     * Lấy thông tin user theo ID
     */
    public ResponseEntity<Apireponsi<UsersEntity>> getUserById(Long id) {
        try {
            UsersEntity user = userRepository.findById(id).orElse(null);
            
            if (user == null) {
                return httpResponseUtil.notFound("Không tìm thấy user với ID: " + id);
            }
            
            // Ẩn password
            user.setPassword(null);
            
            return httpResponseUtil.ok("Lấy thông tin user thành công", user);
        } catch (Exception e) {
            return httpResponseUtil.error("Lỗi khi lấy thông tin user", e);
        }
    }

    /**
     * Cập nhật role của user
     */
    public ResponseEntity<Apireponsi<UsersEntity>> updateUserRole(Long userId, String newRoleName) {
        try {
            UsersEntity user = userRepository.findById(userId).orElse(null);
            
            if (user == null) {
                return httpResponseUtil.notFound("Không tìm thấy user với ID: " + userId);
            }
            
            RoleEntity newRole = rolesRepository.findByName(newRoleName);
            if (newRole == null) {
                return httpResponseUtil.badRequest("Role không hợp lệ: " + newRoleName);
            }
            
            // Không cho phép đổi role của ADMIN
            if (user.getRole().getName().equals("ADMIN")) {
                return httpResponseUtil.badRequest("Không thể thay đổi role của ADMIN");
            }
            
            user.setRole(newRole);
            userRepository.save(user);
            
            // Ẩn password
            user.setPassword(null);
            
            return httpResponseUtil.ok("Cập nhật role thành công", user);
        } catch (Exception e) {
            return httpResponseUtil.error("Lỗi khi cập nhật role", e);
        }
    }

    /**
     * Khóa/Mở khóa user
     */
    public ResponseEntity<Apireponsi<UsersEntity>> toggleLockUser(Long userId) {
        try {
            UsersEntity user = userRepository.findById(userId).orElse(null);
            
            if (user == null) {
                return httpResponseUtil.notFound("Không tìm thấy user với ID: " + userId);
            }
            
            // Không cho phép khóa ADMIN
            if (user.getRole().getName().equals("ADMIN")) {
                return httpResponseUtil.badRequest("Không thể khóa tài khoản ADMIN");
            }
            
            // Toggle lock status
            user.setLocked(!user.isLocked());
            userRepository.save(user);
            
            // Ẩn password
            user.setPassword(null);
            
            String message = user.isLocked() ? "Khóa tài khoản thành công" : "Mở khóa tài khoản thành công";
            return httpResponseUtil.ok(message, user);
        } catch (Exception e) {
            return httpResponseUtil.error("Lỗi khi khóa/mở khóa user", e);
        }
    }

    /**
     * Lấy thống kê số lượng users theo role
     */
    public ResponseEntity<Apireponsi<Object>> getUserStats() {
        try {
            List<UsersEntity> allUsers = (List<UsersEntity>) userRepository.findAll();
            
            long totalUsers = allUsers.size();
            long userCount = allUsers.stream()
                    .filter(u -> u.getRole().getName().equals("USER"))
                    .count();
            long ownerCount = allUsers.stream()
                    .filter(u -> u.getRole().getName().equals("OWNER"))
                    .count();
            long adminCount = allUsers.stream()
                    .filter(u -> u.getRole().getName().equals("ADMIN"))
                    .count();
            
            java.util.Map<String, Object> stats = new java.util.HashMap<>();
            stats.put("totalUsers", totalUsers);
            stats.put("userCount", userCount);
            stats.put("ownerCount", ownerCount);
            stats.put("adminCount", adminCount);
            
            return httpResponseUtil.ok("Lấy thống kê thành công", stats);
        } catch (Exception e) {
            return httpResponseUtil.error("Lỗi khi lấy thống kê", e);
        }
    }
}

