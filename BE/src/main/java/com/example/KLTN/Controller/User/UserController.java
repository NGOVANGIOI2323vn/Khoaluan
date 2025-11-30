package com.example.KLTN.Controller.User;

import com.example.KLTN.Config.HTTPstatus.HttpResponseUtil;
import com.example.KLTN.Service.UserService;
import com.example.KLTN.dto.Apireponsi;
import com.example.KLTN.dto.ChangePasswordDTO;
import com.example.KLTN.dto.UpdateProfileDTO;
import com.example.KLTN.Entity.UsersEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final HttpResponseUtil httpResponseUtil;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/profile")
    public ResponseEntity<Apireponsi<UsersEntity>> getProfile() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            UsersEntity user = userService.FindByUsername(username);
            
            if (user == null) {
                return httpResponseUtil.notFound("User not found");
            }
            
            // Không trả về password
            user.setPassword(null);
            
            return httpResponseUtil.ok("Get profile success", user);
        } catch (Exception e) {
            return httpResponseUtil.error("Error getting profile", e);
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<Apireponsi<UsersEntity>> updateProfile(@RequestBody UpdateProfileDTO dto) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            UsersEntity user = userService.FindByUsername(username);
            
            if (user == null) {
                return httpResponseUtil.notFound("User not found");
            }
            
            // Kiểm tra email đã tồn tại chưa (nếu thay đổi email)
            if (!user.getEmail().equals(dto.getEmail())) {
                if (userService.ExistsEmail(dto.getEmail())) {
                    return httpResponseUtil.badRequest("Email đã được sử dụng");
                }
            }
            
            // Kiểm tra username đã tồn tại chưa (nếu thay đổi username)
            if (!user.getUsername().equals(dto.getUsername())) {
                if (userService.Exists(dto.getUsername())) {
                    return httpResponseUtil.badRequest("Username đã được sử dụng");
                }
            }
            
            // Cập nhật thông tin
            user.setUsername(dto.getUsername());
            user.setEmail(dto.getEmail());
            user.setPhone(dto.getPhone());
            
            userService.SaveUser(user);
            
            // Không trả về password
            user.setPassword(null);
            
            return httpResponseUtil.ok("Update profile success", user);
        } catch (Exception e) {
            return httpResponseUtil.error("Error updating profile", e);
        }
    }

    @PutMapping("/password")
    public ResponseEntity<Apireponsi<String>> changePassword(@RequestBody ChangePasswordDTO dto) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            UsersEntity user = userService.FindByUsername(username);
            
            if (user == null) {
                return httpResponseUtil.notFound("User not found");
            }
            
            // Kiểm tra mật khẩu cũ
            if (!passwordEncoder.matches(dto.getOldPassword(), user.getPassword())) {
                return httpResponseUtil.badRequest("Mật khẩu cũ không đúng");
            }
            
            // Cập nhật mật khẩu mới
            user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
            userService.SaveUser(user);
            
            return httpResponseUtil.ok("Change password success", "Mật khẩu đã được thay đổi thành công");
        } catch (Exception e) {
            return httpResponseUtil.error("Error changing password", e);
        }
    }
}

