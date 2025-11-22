package com.example.KLTN.Config.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.core.userdetails.UserDetailsService;

@Configuration
public class ApplicationConfig {
    private final UserDetailsService userDetailsService;
private final JwtUtill jwtUtill;
    
    public ApplicationConfig(UserDetailsService userDetailsService, JwtUtill jwtUtill) {
        this.userDetailsService = userDetailsService;
        this.jwtUtill = jwtUtill;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(jwtUtill.passwordEncoder());
        return authProvider;
    }

    @Bean
    @Primary
    public ObjectMapper objectMapper(Jackson2ObjectMapperBuilder builder) {
        // Sử dụng Jackson2ObjectMapperBuilder để đảm bảo tương thích với Spring Boot
        // Spring Boot sẽ tự động cấu hình JavaTimeModule nếu có dependency
        return builder.build();
    }
}