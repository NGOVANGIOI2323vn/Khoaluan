package com.example.KLTN.Service;

import com.example.KLTN.Config.config.JwtUtill;
import com.example.KLTN.Entity.RoleEntity;
import com.example.KLTN.Entity.UsersEntity;
import com.example.KLTN.Entity.WalletsEntity;
import com.example.KLTN.Repository.RolesRepository;
import com.example.KLTN.Repository.UserRepository;
import com.example.KLTN.Service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CustomOidcUserService extends OidcUserService {

    private final UserRepository userRepository;
    private final RolesRepository roleRepository;
    private final JwtUtill jwtUtil;
    private final WalletService walletService;
    // ✅ biến static lưu tạm token
    public static String latestJwtToken;
    // ✅ biến static lưu tạm error message
    public static String latestErrorMessage;

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) {
        // Reset error message
        latestErrorMessage = null;
        latestJwtToken = null;
        
        OidcUser oidcUser = super.loadUser(userRequest);
        
        Map<String, Object> attributes = oidcUser.getAttributes();
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        
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

        return oidcUser;
    }
}

