package com.example.KLTN.Config.config;

import com.example.KLTN.Service.CustomOAuth2UserService;
import com.example.KLTN.Service.CustomOidcUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;
    private final CorsConfigurationSource corsConfigurationSource;
    private final SecurityExceptionHandler securityExceptionHandler;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final CustomOidcUserService customOidcUserService;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;
    private final ClientRegistrationRepository clientRegistrationRepository;
    
    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                // OAuth2 cần session để lưu state, chỉ dùng STATELESS cho JWT API
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                )
                .authenticationProvider(authenticationProvider)
                .authorizeHttpRequests(auth -> auth
                        // Allow OPTIONS requests for CORS preflight
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Public static resources - QR codes
                        .requestMatchers("/uploads/qr/**").permitAll()
                        // Public API
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/oauth2/**", "/login/**", "/success", "/error").permitAll()
                        // VNPay callback (public - VNPay server gọi về)
                        .requestMatchers(HttpMethod.GET, "/api/vnpay/return").permitAll()
                        // VNPay create payment (cần authentication)
                        .requestMatchers(HttpMethod.POST, "/api/vnpay/create").hasAnyRole("OWNER", "USER", "ADMIN")
                        // Public Hotel & Room endpoints
                        .requestMatchers(HttpMethod.GET, "/api/hotels").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/hotels/{id}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/hotels/{id}/rooms").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/hotels/{id}/reviews").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/hotels/owner/my-hotels").hasRole("OWNER")
                        // Public Info endpoints
                        .requestMatchers(HttpMethod.GET, "/api/info/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/info/contact/message").permitAll()
                        // Public Geocoding endpoints
                        .requestMatchers(HttpMethod.POST, "/api/geocoding/geocode-address").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/geocoding/place-autocomplete").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/geocoding/place-details").permitAll()
                        // Admin Geocoding endpoints
                        .requestMatchers(HttpMethod.POST, "/api/geocoding/admin/**").hasRole("ADMIN")
                        // Public Chat endpoint (không cần đăng nhập)
                        .requestMatchers(HttpMethod.POST, "/api/chat").permitAll()
                        // Role-based API - Hotels
                        .requestMatchers(HttpMethod.POST, "/api/hotels").hasRole("OWNER")
                        .requestMatchers(HttpMethod.PUT, "/api/hotels/{id}").hasAnyRole("OWNER", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/hotels/{id}/discount").hasRole("OWNER")
                        // Role-based API - Rooms
                        .requestMatchers(HttpMethod.PUT, "/api/rooms/**").hasRole("OWNER")
                        // Role-based API - Bookings (đặt các rule cụ thể trước rule generic)
                        .requestMatchers(HttpMethod.GET, "/api/bookings/rooms/{roomId}").hasAnyRole("OWNER", "USER", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/bookings/{id}/pay").hasRole("USER")
                        .requestMatchers(HttpMethod.GET, "/api/bookings/{id}").permitAll() // Cho phép public để quét QR
                        .requestMatchers(HttpMethod.GET, "/api/bookings").hasRole("USER")
                        .requestMatchers(HttpMethod.POST, "/api/bookings/**").hasRole("USER")
                        // Role-based API - Reviews
                        .requestMatchers(HttpMethod.POST, "/api/hotels/{id}/reviews").hasRole("USER")
                        // Role-based API - User Profile
                        .requestMatchers(HttpMethod.GET, "/api/user/profile").hasAnyRole("OWNER", "USER", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/user/profile").hasAnyRole("OWNER", "USER", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/user/password").hasAnyRole("OWNER", "USER", "ADMIN")
                        // Role-based API - Wallet
                        .requestMatchers(HttpMethod.GET, "/api/wallet/balance").hasAnyRole("OWNER", "USER", "ADMIN")
                        // Role-based API - Withdraws
                        .requestMatchers(HttpMethod.POST, "/api/withdraws").hasAnyRole("OWNER", "USER")
                        .requestMatchers(HttpMethod.GET, "/api/withdraws").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/withdraws/my-withdraws").hasAnyRole("OWNER", "USER")
                        .requestMatchers(HttpMethod.PUT, "/api/withdraws/{id}/approve").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/withdraws/{id}/reject").hasRole("ADMIN")
                        // Role-based API - Admin
                        .requestMatchers(HttpMethod.POST, "/api/admin/percent").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/admin/percent").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/admin/percent").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/admin/transactions/{id}/approve").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/admin/transactions").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/admin/transactions/{id}").hasAnyRole("ADMIN", "OWNER")
                        .requestMatchers(HttpMethod.GET, "/api/admin/transactions/owner/my-transactions").hasRole("OWNER")
                        .requestMatchers(HttpMethod.GET, "/api/admin/transactions/revenue/admin").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/admin/transactions/revenue/owner").hasRole("OWNER")
                        // Admin Hotel Management
                        .requestMatchers(HttpMethod.GET, "/api/admin/hotels/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/admin/hotels/**").hasRole("ADMIN")
                        // All others
                        .anyRequest().authenticated()
                )
                // Exception handling - trả về JSON thay vì redirect
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(securityExceptionHandler)
                        .accessDeniedHandler(securityExceptionHandler)
                )
                // OAuth2 login
                .oauth2Login(oauth -> oauth
                        .successHandler(oAuth2SuccessHandler)
                        .failureUrl(frontendUrl + "/login?error=oauth2_failed")
                        .authorizationEndpoint(authorization -> authorization
                                .authorizationRequestResolver(
                                        new CustomOAuth2AuthorizationRequestResolver(
                                                new org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver(
                                                        clientRegistrationRepository,
                                                        "/oauth2/authorization"
                                                )
                                        )
                                )
                        )
                        .userInfoEndpoint(userInfo -> userInfo
                                .oidcUserService(customOidcUserService)
                                .userService(customOAuth2UserService)
                        )
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
