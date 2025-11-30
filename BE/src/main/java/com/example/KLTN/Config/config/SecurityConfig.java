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

                // Session cho OAuth2 - không dùng stateless cho toàn bộ
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                )

                .authenticationProvider(authenticationProvider)

                .authorizeHttpRequests(auth -> auth

                        /* ============================
                         *   AUTH & FORGOT PASSWORD
                         * ============================ */

                        // QUÊN MẬT KHẨU (PUBLIC)
                        .requestMatchers(HttpMethod.POST,
                                "/api/auth/forgot-password/send-otp",
                                "/api/auth/forgot-password/verify-otp",
                                "/api/auth/forgot-password/reset"
                        ).permitAll()

                        // ĐỔI MẬT KHẨU (PHẢI ĐĂNG NHẬP)
                        .requestMatchers(HttpMethod.POST, "/api/auth/change-password")
                        .authenticated()

                        // Các API auth còn lại PUBLIC
                        .requestMatchers("/api/auth/**").permitAll()

                        // PUBLIC cho OAuth2
                        .requestMatchers("/oauth2/**", "/login/**", "/success", "/error").permitAll()

                        // VNPay public
                        .requestMatchers("/api/vnpay/**").permitAll()

                        // Public hotel endpoints
                        .requestMatchers(HttpMethod.GET, "/api/hotels").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/hotels/{id}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/hotels/{id}/rooms").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/hotels/{id}/reviews").permitAll()

                        .requestMatchers(HttpMethod.GET, "/api/hotels/owner/my-hotels").hasRole("OWNER")

                        // Public Info
                        .requestMatchers(HttpMethod.GET, "/api/info/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/info/contact/message").permitAll()

                        // Geocoding public
                        .requestMatchers(HttpMethod.POST, "/api/geocoding/geocode-address").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/geocoding/place-autocomplete").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/geocoding/place-details").permitAll()

                        // Geocoding admin
                        .requestMatchers(HttpMethod.POST, "/api/geocoding/admin/**").hasRole("ADMIN")

                        // Chat public
                        .requestMatchers(HttpMethod.POST, "/api/chat").permitAll()

                        // Hotels
                        .requestMatchers(HttpMethod.POST, "/api/hotels").hasRole("OWNER")
                        .requestMatchers(HttpMethod.PUT, "/api/hotels/{id}").hasAnyRole("OWNER", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/hotels/{id}/discount").hasRole("OWNER")

                        // Rooms
                        .requestMatchers(HttpMethod.PUT, "/api/rooms/**").hasRole("OWNER")

                        // Bookings
                        .requestMatchers(HttpMethod.POST, "/api/bookings/**").hasRole("USER")
                        .requestMatchers(HttpMethod.PUT, "/api/bookings/{id}/pay").hasRole("USER")
                        .requestMatchers(HttpMethod.GET, "/api/bookings").hasRole("USER")
                        .requestMatchers(HttpMethod.GET, "/api/bookings/rooms/{roomId}")
                        .hasAnyRole("OWNER", "ADMIN")

                        // Reviews
                        .requestMatchers(HttpMethod.POST, "/api/hotels/{id}/reviews").hasRole("USER")

                        // Withdraws
                        .requestMatchers(HttpMethod.POST, "/api/withdraws").hasAnyRole("OWNER", "USER")
                        .requestMatchers(HttpMethod.GET, "/api/withdraws").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/withdraws/my-withdraws")
                        .hasAnyRole("OWNER", "USER")
                        .requestMatchers(HttpMethod.PUT, "/api/withdraws/{id}/approve").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/withdraws/{id}/reject").hasRole("ADMIN")

                        // Admin
                        .requestMatchers(HttpMethod.POST, "/api/admin/percent").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/admin/percent").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/admin/percent").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/admin/transactions/{id}/approve").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/admin/transactions").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/admin/transactions/{id}")
                        .hasAnyRole("ADMIN", "OWNER")
                        .requestMatchers(HttpMethod.GET,
                                "/api/admin/transactions/owner/my-transactions").hasRole("OWNER")

                        .anyRequest().authenticated()
                )

                /* EXCEPTIONS: trả JSON thay vì redirect */
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(securityExceptionHandler)
                        .accessDeniedHandler(securityExceptionHandler)
                )

                /* LOGIN OAuth2 */
                .oauth2Login(oauth -> oauth
                        .successHandler(oAuth2SuccessHandler)
                        .failureUrl(frontendUrl + "/login?error=oauth2_failed")
                        .authorizationEndpoint(authorization -> authorization
                                .authorizationRequestResolver(
                                        new CustomOAuth2AuthorizationRequestResolver(
                                                new org.springframework.security.oauth2.client.web
                                                        .DefaultOAuth2AuthorizationRequestResolver(
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

                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
