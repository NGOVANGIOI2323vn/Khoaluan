package com.example.KLTN.Service;


import com.example.KLTN.Config.config.JwtUtill;
import com.example.KLTN.Entity.RoleEntity;
import com.example.KLTN.Entity.UsersEntity;
import com.example.KLTN.Entity.WalletsEntity;
import com.example.KLTN.Repository.RolesRepository;
import com.example.KLTN.Repository.UserRepository;
import com.example.KLTN.Service.WalletService;

import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final RolesRepository roleRepository;
    private final JwtUtill jwtUtil;
    private final WalletService walletService;
    // ✅ biến static lưu tạm token
    public static String latestJwtToken;
    // ✅ biến static lưu tạm error message
    public static String latestErrorMessage;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        // Reset error message
        latestErrorMessage = null;
        latestJwtToken = null;
        
        OAuth2User oAuth2User = super.loadUser(userRequest);
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        if (email == null || email.isBlank()) {
            latestErrorMessage = "Không thể lấy email từ tài khoản Google. Vui lòng bật quyền truy cập email.";
            throw new OAuth2AuthenticationException(latestErrorMessage);
        }
        UsersEntity user = userRepository.findByEmail(email);
        if (user == null) {
            RoleEntity roleUser = roleRepository.findByName("USER");
            if (roleUser == null) {
                latestErrorMessage = "Không tìm thấy ROLE_USER trong hệ thống. Hãy khởi tạo dữ liệu role trước.";
                throw new OAuth2AuthenticationException(latestErrorMessage);
            }
            user = UsersEntity.builder()
                    .username(name != null ? name : "Google User")
                    .email(email)
                    .password("GOOGLE_ACCOUNT")
                    .phone("0")
                    .verified(true)
                    .locked(false)
                    .role(roleUser)
                    .build();
            userRepository.save(user);

        }
        
        // Kiểm tra tài khoản bị khóa
        if (user.isLocked()) {
            latestErrorMessage = "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.";
            throw new OAuth2AuthenticationException(latestErrorMessage);
        }
        if (user.getWallet() == null) {
            WalletsEntity wallet = new WalletsEntity();
            wallet.setBalance(BigDecimal.ZERO);
            wallet.setUser(user);
            walletService.SaveWallet(wallet);
            // Refresh user để load wallet từ database
            user = userRepository.findById(user.getId()).orElse(user);
        }
        // ✅ Sinh token và lưu tạm
        String token = jwtUtil.generateToken(user.getUsername());
        latestJwtToken = token;

        return oAuth2User;
    }


}