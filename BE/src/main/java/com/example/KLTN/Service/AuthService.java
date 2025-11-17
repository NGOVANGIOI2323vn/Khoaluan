package com.example.KLTN.Service;

import com.example.KLTN.Config.Email.RandomOTP;
import com.example.KLTN.Config.HTTPstatus.HttpResponseUtil;
import com.example.KLTN.Config.config.JwtUtill;
import com.example.KLTN.Entity.RoleEntity;
import com.example.KLTN.Entity.UsersEntity;
import com.example.KLTN.Entity.WalletsEntity;
import com.example.KLTN.Service.Impl.AuthServiceImpl;
import com.example.KLTN.dto.Apireponsi;
import com.example.KLTN.dto.LoginResponseDTO;
import com.example.KLTN.dto.RegisterUserDto;
import com.example.KLTN.dto.VerifyDTO;
import com.example.KLTN.dto.authRequesDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.example.KLTN.Config.Email.EmailCl;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService implements AuthServiceImpl {
    private final UserService userService;
    private final RoleService roleService;
    private final JwtUtill jwtUtil;
    private final EmailCl emailUtil;
    private final AuthenticationManager authenticationManager;
    private final HttpResponseUtil responseUtil;
    private final WalletService walletService;

    // ===================== REGISTER USER =====================
    public ResponseEntity<Apireponsi<UsersEntity>> registerUser(RegisterUserDto dto, String roleName) {
        try {
            // Validate input
            if (dto.getUsername() == null || dto.getUsername().trim().isEmpty()) {
                return responseUtil.badRequest("Username không được để trống");
            }
            if (dto.getEmail() == null || dto.getEmail().trim().isEmpty()) {
                return responseUtil.badRequest("Email không được để trống");
            }
            if (dto.getPassword() == null || dto.getPassword().trim().isEmpty()) {
                return responseUtil.badRequest("Password không được để trống");
            }
            String phone = dto.getPhone();
            if (phone == null || phone.trim().isEmpty()) {
                return responseUtil.badRequest("Phone không được để trống");
            }
            
            // Check if username exists
            if (userService.Exists(dto.getUsername())) {
                return responseUtil.conflict("Username đã tồn tại");
            }
            
            // Check if email exists
            if (userService.ExistsEmail(dto.getEmail())) {
                return responseUtil.conflict("Email đã tồn tại");
            }
            
            // Get role
            RoleEntity role = roleService.finByRolename(roleName);
            if (role == null) {
                return responseUtil.badRequest("ROLE không tồn tại: " + roleName);
            }

            // Create user
            UsersEntity user = new UsersEntity();
            user.setUsername(dto.getUsername());
            user.setPassword(jwtUtil.passwordEncoder().encode(dto.getPassword()));
            user.setEmail(dto.getEmail());
            user.setPhone(phone); // Use the validated phone variable
            user.setRole(role);
            user.setVerified(false);
            
            this.userService.SaveUser(user);

            // Create wallet
            WalletsEntity wallet = new WalletsEntity();
            wallet.setUser(user);
            wallet.setBalance(BigDecimal.ZERO);
            walletService.SaveWallet(wallet);

            return responseUtil.created("Đăng ký thành công. Vui lòng gửi OTP để xác nhận Gmail.", user);
        } catch (Exception e) {
            System.err.println("ERROR in register: " + e.getClass().getName() + ": " + e.getMessage());
            e.printStackTrace(); // Log exception để debug
            return responseUtil.error("Lỗi khi đăng ký tài khoản: " + e.getMessage(), e);
        }
    }

    // ===================== SEND OTP =====================
    public ResponseEntity<Apireponsi<String>> sendOtp(String email) {
        try {
            UsersEntity user = userService.findByEmail(email);
            if (user == null) {
                return responseUtil.notFound("Email không tồn tại");
            }
            if (user.isVerified()) {
                return responseUtil.badRequest("Email đã xác thực, không cần gửi lại OTP");
            }

            String otp = RandomOTP.generateOTP(6);
            user.setOtp(otp);
            user.setTimeExpired(LocalDateTime.now().plusMinutes(5));
            userService.SaveUser(user);

            emailUtil.sendOTP(user.getEmail(), otp);
            return responseUtil.ok("OTP đã được gửi đến email.");
        } catch (Exception e) {
            return responseUtil.error("Gửi OTP thất bại", e);
        }
    }

    // ===================== VERIFY OTP =====================
    public ResponseEntity<Apireponsi<String>> verifyOtp(VerifyDTO dto) {
        try {
            UsersEntity user = userService.findByEmail(dto.getEmail());
            if (user == null) return responseUtil.notFound("User không tồn tại");
            if (user.isVerified()) return responseUtil.badRequest("User đã được xác thực");

            boolean otpValid = user.getOtp() != null
                    && user.getOtp().equals(dto.getOtp())
                    && user.getTimeExpired().isAfter(LocalDateTime.now());

            if (!otpValid) return responseUtil.badRequest("OTP sai hoặc đã hết hạn");

            user.setOtp(null);
            user.setVerified(true);
            user.setTimeExpired(null);
            userService.SaveUser(user);

            return responseUtil.ok("Xác nhận email thành công.");
        } catch (Exception e) {
            return responseUtil.error("Lỗi khi xác thực OTP", e);
        }
    }

    // ===================== LOGIN =====================
    public ResponseEntity<Apireponsi<LoginResponseDTO>> login(authRequesDTO dto) {
        try {
            // Lấy user trước khi authenticate để đảm bảo user tồn tại
            UsersEntity user = userService.FindByUsername(dto.getUsername());
            if (user == null) {
                return responseUtil.notFound("User không tồn tại");
            }
            
            if (!user.isVerified()) {
                return responseUtil.badRequest("Tài khoản chưa xác thực email");
            }
            
            if (user.getRole() == null) {
                return responseUtil.error("Lỗi: User không có role được gán", new Exception("User role is null"));
            }
            
            // Authenticate sau khi đã verify user tồn tại
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(dto.getUsername(), dto.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);

            String token = jwtUtil.generateToken(user.getUsername());
            
            // Tạo response với token và thông tin user
            LoginResponseDTO loginResponse = new LoginResponseDTO();
            loginResponse.setToken(token);
            loginResponse.setUsername(user.getUsername());
            loginResponse.setEmail(user.getEmail());
            loginResponse.setRole(user.getRole().getName());
            loginResponse.setUserId(user.getId());

            return responseUtil.ok("Login thành công", loginResponse);
        } catch (BadCredentialsException e) {
            return responseUtil.unauthorized("Sai tài khoản hoặc mật khẩu");
        } catch (Exception e) {
            System.err.println("ERROR in login: " + e.getClass().getName() + ": " + e.getMessage());
            e.printStackTrace(); // Log exception để debug
            return responseUtil.error("Lỗi khi đăng nhập: " + e.getMessage(), e);
        }
    }

    // ===================== LOGIN SUCCESS OAUTH2 =====================
    public ResponseEntity<Apireponsi<String>> loginOAuth2Success(String token) {
        return responseUtil.ok("Login OAuth2 thành công", token);
    }
}
