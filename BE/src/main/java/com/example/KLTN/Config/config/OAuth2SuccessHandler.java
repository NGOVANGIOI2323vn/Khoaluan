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
        
        System.out.println("=== OAuth2SuccessHandler called ===");
        System.out.println("Authentication: " + authentication);
        
        // Lấy token từ CustomOidcUserService hoặc CustomOAuth2UserService (static variable)
        String token = com.example.KLTN.Service.CustomOidcUserService.latestJwtToken;
        if (token == null || token.isBlank()) {
            token = com.example.KLTN.Service.CustomOAuth2UserService.latestJwtToken;
        }
        System.out.println("Token from static variable: " + (token != null ? "EXISTS" : "NULL"));
        
        if (token != null && !token.isBlank()) {
            // Redirect đến frontend với token trong URL
            String targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/oauth2/callback")
                    .queryParam("token", token)
                    .build().toUriString();
            
            System.out.println("Redirecting to: " + targetUrl);
            getRedirectStrategy().sendRedirect(request, response, targetUrl);
        } else {
            // Nếu không có token, redirect về login với lỗi
            System.out.println("Token is null or blank, redirecting to login with error");
            String targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/login")
                    .queryParam("error", "oauth2_token_missing")
                    .build().toUriString();
            
            getRedirectStrategy().sendRedirect(request, response, targetUrl);
        }
    }
}

