package com.example.KLTN.Config.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                .authorizeHttpRequests(auth -> auth
                        // Public API
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/oauth2/**", "/login/**", "/success", "/error").permitAll()
                        .requestMatchers("/api/vnpay/**").permitAll()
                        // Role-based API
                        .requestMatchers(HttpMethod.POST, "/api/withdraw/create").hasAnyRole("OWNER", "USER")
                        .requestMatchers(HttpMethod.PUT, "/api/withdraw/approve/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/withdraw/reject/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/hotel/create").hasRole("OWNER")
                        .requestMatchers(HttpMethod.GET, "/api/hotel/list").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/hotel/update/**").hasAnyRole("OWNER", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/rooms/**").hasRole("OWNER")
                        .requestMatchers(HttpMethod.PUT, "/api/hotel/setAll_discount_percent/**").hasRole("OWNER")
                        .requestMatchers(HttpMethod.POST, "/api/booking/create/**").hasRole("USER")
                        .requestMatchers(HttpMethod.PUT, "/api/booking/pay/**").hasRole("USER")
                        .requestMatchers(HttpMethod.POST,"/api/admin/percent/create/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT,"/api/admin/percent/update/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT,"/api/admin/transaction/setTransaction/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET,"/api/admin/transaction/getAll").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET,"/api/admin/transaction/get/**").hasAnyRole("ADMIN", "OWNER")
                        .requestMatchers(HttpMethod.POST,"/api/hotel/ceateComment/**").hasRole("USER")
                        // All others
                        .anyRequest().authenticated()
                )
                // OAuth2 login
                .oauth2Login(oauth -> oauth
                        .defaultSuccessUrl("/home", true)
                        .defaultSuccessUrl("/api/auth/success", true)
                        .failureUrl("/api/auth/login?error=true")
                )
                // Add JWT filter
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
