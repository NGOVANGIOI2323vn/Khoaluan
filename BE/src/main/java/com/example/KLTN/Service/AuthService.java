package com.example.KLTN.Service;

import com.example.KLTN.Config.Email.RandomOTP;
import com.example.KLTN.Config.HTTPstatus.HttpResponseUtil;
import com.example.KLTN.Config.config.JwtUtill;
import com.example.KLTN.Entity.RoleEntity;
import com.example.KLTN.Entity.UsersEntity;
import com.example.KLTN.Entity.WalletsEntity;
import com.example.KLTN.Service.Impl.AuthServiceImpl;
import com.example.KLTN.dto.Apireponsi;
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
            if (userService.Exists(dto.getUsername())) {
                return responseUtil.conflict("Username đã tồn tại");
            }
            if (userService.ExistsEmail(dto.getEmail())) {
                return responseUtil.conflict("Email đã tồn tại");
            }
            RoleEntity role = roleService.finByRolename(roleName);
            if (role == null) {
                return responseUtil.badRequest("ROLE không tồn tại");
            }

            UsersEntity user = new UsersEntity();
            user.setUsername(dto.getUsername());
            user.setPassword(jwtUtil.passwordEncoder().encode(dto.getPassword()));
            user.setEmail(dto.getEmail());
            user.setPhone(dto.getPhone());
            user.setRole(role);
            user.setVerified(false);
            this.userService.SaveUser(user);

            WalletsEntity wallet = new WalletsEntity();
            wallet.setUser(user);
            wallet.setBalance(BigDecimal.ZERO);
            walletService.SaveWallet(wallet);

            return responseUtil.created("Đăng ký thành công. Vui lòng gửi OTP để xác nhận Gmail.", user);
        } catch (Exception e) {
            return responseUtil.error("Lỗi khi đăng ký tài khoản", e);
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
    public ResponseEntity<Apireponsi<String>> login(authRequesDTO dto) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(dto.getUsername(), dto.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);

            UsersEntity user = userService.FindByUsername(dto.getUsername());
            if (user == null) return responseUtil.notFound("User không tồn tại");
            if (!user.isVerified()) return responseUtil.badRequest("Tài khoản chưa xác thực email");

            String token = jwtUtil.generateToken(user.getUsername());
            return responseUtil.ok("Login thành công", token);
        } catch (BadCredentialsException e) {
            return responseUtil.unauthorized("Sai tài khoản hoặc mật khẩu");
        } catch (Exception e) {
            return responseUtil.error("Lỗi khi đăng nhập", e);
        }
    }

    // ===================== LOGIN SUCCESS OAUTH2 =====================
    public ResponseEntity<Apireponsi<String>> loginOAuth2Success(String token) {
        return responseUtil.ok("Login OAuth2 thành công", token);
    }
}
