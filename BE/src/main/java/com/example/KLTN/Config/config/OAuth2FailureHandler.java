package com.example.KLTN.Config.config;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2FailureHandler extends SimpleUrlAuthenticationFailureHandler {
    
    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
                                        AuthenticationException exception) throws IOException, ServletException {
        
        // Ưu tiên lấy error message từ static variable (được set trước khi throw exception)
        String errorMessage = com.example.KLTN.Service.CustomOidcUserService.latestErrorMessage;
        if (errorMessage == null || errorMessage.isBlank()) {
            errorMessage = com.example.KLTN.Service.CustomOAuth2UserService.latestErrorMessage;
        }
        
        // Nếu không có từ static variable, thử lấy từ exception
        if (errorMessage == null || errorMessage.isBlank()) {
            errorMessage = exception.getMessage();
        }
        
        // Nếu vẫn không có message, thử lấy từ cause
        if (errorMessage == null || errorMessage.isBlank()) {
            Throwable cause = exception.getCause();
            if (cause != null) {
                errorMessage = cause.getMessage();
            }
        }
        
        // Kiểm tra nếu là lỗi authorization_request_not_found nhưng có error message từ static variable
        String exceptionMessage = exception.getMessage();
        if ((exceptionMessage != null && exceptionMessage.contains("authorization_request_not_found")) 
            && (errorMessage != null && !errorMessage.isBlank())) {
            // Giữ nguyên error message từ static variable (có thể là "Tài khoản đã bị khóa")
        } else if (exceptionMessage != null && exceptionMessage.contains("authorization_request_not_found")) {
            // Nếu là authorization_request_not_found nhưng không có error message từ static variable
            // Có thể là do session hết hạn hoặc lỗi khác
            errorMessage = "Phiên đăng nhập đã hết hạn. Vui lòng thử lại.";
        }
        
        // Kiểm tra nếu là lỗi tài khoản bị khóa
        if (errorMessage != null && (errorMessage.contains("khóa") || errorMessage.contains("locked"))) {
            errorMessage = "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.";
        } else if (errorMessage == null || errorMessage.isBlank()) {
            errorMessage = "Đăng nhập Google thất bại. Vui lòng thử lại.";
        }
        
        // Reset static error message sau khi sử dụng
        com.example.KLTN.Service.CustomOidcUserService.latestErrorMessage = null;
        com.example.KLTN.Service.CustomOAuth2UserService.latestErrorMessage = null;
        
        // Encode error message để tránh lỗi URL
        String encodedError = java.net.URLEncoder.encode(errorMessage, java.nio.charset.StandardCharsets.UTF_8);
        
        // Redirect về frontend login với thông báo lỗi
        String targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/login")
                .queryParam("error", "oauth2_failed")
                .queryParam("message", encodedError)
                .build().toUriString();
        
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}

