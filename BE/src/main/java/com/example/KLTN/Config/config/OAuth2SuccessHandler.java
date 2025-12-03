package com.example.KLTN.Config.config;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    
    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        try {
            // Kiểm tra error message trước (từ CustomOidcUserService hoặc CustomOAuth2UserService)
            String errorMessage = com.example.KLTN.Service.CustomOidcUserService.latestErrorMessage;
            if (errorMessage == null || errorMessage.isBlank()) {
                errorMessage = com.example.KLTN.Service.CustomOAuth2UserService.latestErrorMessage;
            }
            
            // Nếu có error message (ví dụ: tài khoản bị khóa), redirect về login với error
            if (errorMessage != null && !errorMessage.isBlank()) {
                // Reset error message sau khi sử dụng
                com.example.KLTN.Service.CustomOidcUserService.latestErrorMessage = null;
                com.example.KLTN.Service.CustomOAuth2UserService.latestErrorMessage = null;
                
                String encodedError = java.net.URLEncoder.encode(errorMessage, java.nio.charset.StandardCharsets.UTF_8);
                String targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/login")
                        .queryParam("error", "oauth2_failed")
                        .queryParam("message", encodedError)
                        .build().toUriString();
                
                getRedirectStrategy().sendRedirect(request, response, targetUrl);
                return;
            }
            
            // Lấy token từ CustomOidcUserService hoặc CustomOAuth2UserService (static variable)
            String token = com.example.KLTN.Service.CustomOidcUserService.latestJwtToken;
            if (token == null || token.isBlank()) {
                token = com.example.KLTN.Service.CustomOAuth2UserService.latestJwtToken;
            }
            
            if (token != null && !token.isBlank()) {
                // Reset token sau khi sử dụng
                com.example.KLTN.Service.CustomOidcUserService.latestJwtToken = null;
                com.example.KLTN.Service.CustomOAuth2UserService.latestJwtToken = null;
                
                // Redirect đến frontend với token trong URL
                String targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/oauth2/callback")
                        .queryParam("token", token)
                        .build().toUriString();
                
                getRedirectStrategy().sendRedirect(request, response, targetUrl);
            } else {
                // Nếu không có token, redirect về login với lỗi
                String targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/login")
                        .queryParam("error", "oauth2_token_missing")
                        .queryParam("message", java.net.URLEncoder.encode("Không thể tạo token đăng nhập. Vui lòng thử lại.", java.nio.charset.StandardCharsets.UTF_8))
                        .build().toUriString();
                
                getRedirectStrategy().sendRedirect(request, response, targetUrl);
            }
        } catch (Exception e) {
            // Log exception để debug
            System.err.println("ERROR in OAuth2SuccessHandler: " + e.getClass().getName() + ": " + e.getMessage());
            e.printStackTrace();
            
            // Redirect về login với lỗi generic
            try {
                String targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/login")
                        .queryParam("error", "oauth2_error")
                        .queryParam("message", java.net.URLEncoder.encode("Đăng nhập Google thất bại. Vui lòng thử lại.", java.nio.charset.StandardCharsets.UTF_8))
                        .build().toUriString();
                
                getRedirectStrategy().sendRedirect(request, response, targetUrl);
            } catch (Exception redirectException) {
                // Nếu redirect cũng fail, throw exception
                throw new ServletException("Failed to redirect after OAuth2 error", redirectException);
            }
        }
    }
}

