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
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;
    private final CorsConfigurationSource corsConfigurationSource;
    private final SecurityExceptionHandler securityExceptionHandler;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                .authorizeHttpRequests(auth -> auth
                        // Allow OPTIONS requests for CORS preflight
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Public API
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/oauth2/**", "/login/**", "/success", "/error").permitAll()
                        .requestMatchers("/api/vnpay/**").permitAll()
                        // Public Hotel & Room endpoints
                        .requestMatchers(HttpMethod.GET, "/api/hotels").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/hotels/{id}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/hotels/{id}/rooms").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/hotels/{id}/reviews").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/hotels/owner/my-hotels").hasRole("OWNER")
                        // Public Info endpoints
                        .requestMatchers(HttpMethod.GET, "/api/info/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/info/contact/message").permitAll()
                        // Role-based API - Hotels
                        .requestMatchers(HttpMethod.POST, "/api/hotels").hasRole("OWNER")
                        .requestMatchers(HttpMethod.PUT, "/api/hotels/{id}").hasAnyRole("OWNER", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/hotels/{id}/discount").hasRole("OWNER")
                        // Role-based API - Rooms
                        .requestMatchers(HttpMethod.PUT, "/api/rooms/**").hasRole("OWNER")
                        // Role-based API - Bookings
                        .requestMatchers(HttpMethod.POST, "/api/bookings/**").hasRole("USER")
                        .requestMatchers(HttpMethod.PUT, "/api/bookings/{id}/pay").hasRole("USER")
                        .requestMatchers(HttpMethod.GET, "/api/bookings").hasRole("USER")
                        .requestMatchers(HttpMethod.GET, "/api/bookings/rooms/{roomId}").hasAnyRole("OWNER", "ADMIN")
                        // Role-based API - Reviews
                        .requestMatchers(HttpMethod.POST, "/api/hotels/{id}/reviews").hasRole("USER")
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
