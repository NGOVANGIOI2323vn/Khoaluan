package com.example.KLTN.Controller.Auth;

import com.example.KLTN.Config.HTTPstatus.HttpResponseUtil;
import com.example.KLTN.Config.config.JwtUtill;
import com.example.KLTN.Config.Email.EmailCl;
import com.example.KLTN.Service.*;
import com.example.KLTN.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class authController {
    private final UserService userService;
    private final RoleService roleService;
    private final JwtUtill jwtUtil;
    private final EmailCl emailUtil;
    private final AuthenticationManager authenticationManager;
    private final HttpResponseUtil responseUtil;
    private final WalletService wallettService;
    private final HttpResponseUtil  httpResponseUtil;
    private final AuthService authService;


    // Đăng ký user
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterUserDto dto) {
        return authService.registerUser(dto, "USER");
    }

    // Đăng ký owner
    @PostMapping("/registerOwner")
    public ResponseEntity<?> registerOwner(@RequestBody RegisterUserDto dto) {
        return authService.registerUser(dto, "OWNER");
    }

    // Gửi OTP
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestParam String email) {
        return authService.sendOtp(email);
    }

    // Xác thực OTP
    @PostMapping("/verify-otp")
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

