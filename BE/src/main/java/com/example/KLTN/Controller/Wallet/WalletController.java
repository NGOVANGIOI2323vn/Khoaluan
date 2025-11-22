package com.example.KLTN.Controller.Wallet;

import com.example.KLTN.Config.HTTPstatus.HttpResponseUtil;
import com.example.KLTN.Entity.UsersEntity;
import com.example.KLTN.Entity.WalletsEntity;
import com.example.KLTN.Service.UserService;
import com.example.KLTN.Service.WalletService;
import com.example.KLTN.dto.Apireponsi;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
public class WalletController {
    private final WalletService walletService;
    private final UserService userService;
    private final HttpResponseUtil httpResponseUtil;

    @GetMapping("/balance")
    public ResponseEntity<Apireponsi<WalletBalanceDTO>> getBalance() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
                return httpResponseUtil.badRequest("User not authenticated");
            }
            
            String username = auth.getName();
            UsersEntity user = userService.FindByUsername(username);
            if (user == null) {
                return httpResponseUtil.notFound("User not found");
            }
            
            WalletsEntity wallet = walletService.GetWallet(user);
            if (wallet == null) {
                return httpResponseUtil.notFound("Wallet not found");
            }
            
            WalletBalanceDTO dto = new WalletBalanceDTO();
            dto.setBalance(wallet.getBalance());
            dto.setUserId(user.getId());
            dto.setUsername(user.getUsername());
            
            return httpResponseUtil.ok("Get wallet balance success", dto);
        } catch (Exception e) {
            return httpResponseUtil.error("Error getting wallet balance", e);
        }
    }

    // DTO class
    public static class WalletBalanceDTO {
        private java.math.BigDecimal balance;
        private Long userId;
        private String username;

        public java.math.BigDecimal getBalance() {
            return balance;
        }

        public void setBalance(java.math.BigDecimal balance) {
            this.balance = balance;
        }

        public Long getUserId() {
            return userId;
        }

        public void setUserId(Long userId) {
            this.userId = userId;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }
    }
}

