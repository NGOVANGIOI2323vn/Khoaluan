package com.example.KLTN.Controller.Auth;

import com.example.KLTN.Service.AuthService;
import com.example.KLTN.Service.CustomOAuth2UserService;
import com.example.KLTN.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class authController {
    private final AuthService authService;


    // Đăng ký user
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterUserDto dto) {
        return authService.registerUser(dto, "USER");
    }

    // Đăng ký owner
    @PostMapping("/register/owner")
    public ResponseEntity<?> registerOwner(@RequestBody RegisterUserDto dto) {
        return authService.registerUser(dto, "OWNER");
    }

    // Gửi OTP
    @PostMapping("/otp/send")
    public ResponseEntity<?> sendOtp(@RequestParam String email) {
        return authService.sendOtp(email);
    }

    // Xác thực OTP
    @PostMapping("/otp/verify")
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyDTO dto) {
        return authService.verifyOtp(dto);
    }

    // Login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody authRequesDTO dto) {
        return authService.login(dto);
    }

    // OAuth2 login success
    @GetMapping("/success")
    public ResponseEntity<?> oauth2Success(@RequestParam(required = false) String token) {
        // Ưu tiên lấy token từ parameter, nếu không có thì lấy từ static variable
        String jwtToken = token;
        if (jwtToken == null || jwtToken.isBlank()) {
            jwtToken = CustomOAuth2UserService.latestJwtToken;
        }
        
        if (jwtToken == null || jwtToken.isBlank()) {
            return ResponseEntity.status(401).body("Không tìm thấy token. Vui lòng đăng nhập lại.");
        }
        return authService.loginOAuth2Success(jwtToken);
    }
}

