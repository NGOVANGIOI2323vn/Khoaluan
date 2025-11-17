package com.example.KLTN.Controller.Auth;

import com.example.KLTN.Service.AuthService;
import com.example.KLTN.Service.CustomOAuth2UserService;
import com.example.KLTN.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
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
    public ResponseEntity<?> oauth2Success(@AuthenticationPrincipal OAuth2User user) {
        String token = CustomOAuth2UserService.latestJwtToken;
        return authService.loginOAuth2Success(token);
    }
}

