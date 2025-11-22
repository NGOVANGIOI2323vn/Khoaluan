package com.example.KLTN.Service;


import com.example.KLTN.Config.config.JwtUtill;
import com.example.KLTN.Entity.RoleEntity;
import com.example.KLTN.Entity.UsersEntity;
import com.example.KLTN.Entity.WalletsEntity;
import com.example.KLTN.Repository.RolesRepository;
import com.example.KLTN.Repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final RolesRepository roleRepository;
    private final JwtUtill jwtUtil;
    // ✅ biến static lưu tạm token
    public static String latestJwtToken;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        if (email == null || email.isBlank()) {
            throw new RuntimeException("Không thể lấy email từ tài khoản Google. Vui lòng bật quyền truy cập email.");
        }
        UsersEntity user = userRepository.findByEmail(email);
        if (user == null) {
            RoleEntity roleUser = roleRepository.findByName("USER");
            if (roleUser == null) {
                throw new RuntimeException("Không tìm thấy ROLE_USER trong hệ thống. Hãy khởi tạo dữ liệu role trước.");
            }
            user = UsersEntity.builder()
                    .username(name != null ? name : "Google User")
                    .email(email)
                    .password("GOOGLE_ACCOUNT")
                    .phone("0")
                    .verified(true)
                    .role(roleUser)
                    .build();
            userRepository.save(user);

        }
        if (user.getWallet() == null) {
            WalletsEntity wallet = new WalletsEntity();
            wallet.setBalance(BigDecimal.ZERO);
            wallet.setUser(user);
            user.setWallet(wallet);
        }
        // ✅ Sinh token và lưu tạm
        String token = jwtUtil.generateToken(user.getUsername());
        latestJwtToken = token;
        
        System.out.println("=== CustomOAuth2UserService ===");
        System.out.println("User email: " + email);
        System.out.println("User username: " + user.getUsername());
        System.out.println("Token generated: " + (token != null ? "YES" : "NO"));
        System.out.println("Token saved to static variable: " + (latestJwtToken != null ? "YES" : "NO"));

        return oAuth2User;
    }


}