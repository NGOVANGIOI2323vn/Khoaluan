package com.example.KLTN.Controller.Wallet;

import com.example.KLTN.Config.HTTPstatus.HttpResponseUtil;
import com.example.KLTN.Entity.UsersEntity;
import com.example.KLTN.Entity.WalletTransactionEntity;
import com.example.KLTN.Entity.WalletsEntity;
import com.example.KLTN.Repository.WalletTransactionRepository;
import com.example.KLTN.Service.UserService;
import com.example.KLTN.Service.WalletService;
import com.example.KLTN.dto.Apireponsi;
import com.example.KLTN.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
public class WalletController {
    private final WalletService walletService;
    private final UserService userService;
    private final WalletTransactionRepository walletTransactionRepository;
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

    @GetMapping("/transactions")
    public ResponseEntity<?> getTransactions(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String type
    ) {
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
            
            // Nếu không có page/size, trả về tất cả (backward compatibility)
            if (page == null && size == null) {
                List<WalletTransactionEntity> transactions;
                if (type != null && !type.isEmpty()) {
                    WalletTransactionEntity.TransactionType transactionType = 
                        WalletTransactionEntity.TransactionType.valueOf(type.toUpperCase());
                    transactions = walletTransactionRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                        .stream()
                        .filter(t -> t.getType() == transactionType)
                        .toList();
                } else {
                    transactions = walletTransactionRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
                }
                return httpResponseUtil.ok("Get wallet transactions success", transactions);
            }
            
            // Nếu có page/size, trả về phân trang
            int validPage = page != null && page >= 0 ? page : 0;
            int validSize = size != null && size > 0 ? size : 8;
            Pageable pageable = PageRequest.of(validPage, validSize);
            
            Page<WalletTransactionEntity> transactionPage;
            if (type != null && !type.isEmpty()) {
                WalletTransactionEntity.TransactionType transactionType = 
                    WalletTransactionEntity.TransactionType.valueOf(type.toUpperCase());
                transactionPage = walletTransactionRepository.findByUserIdAndTypeOrderByCreatedAtDesc(
                    user.getId(), transactionType, pageable);
            } else {
                transactionPage = walletTransactionRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable);
            }
            
            PageResponse<WalletTransactionEntity> response = new PageResponse<>(
                transactionPage.getContent(),
                transactionPage.getTotalPages(),
                transactionPage.getTotalElements(),
                transactionPage.getNumber(),
                transactionPage.getSize(),
                transactionPage.hasNext(),
                transactionPage.hasPrevious()
            );
            
            return httpResponseUtil.ok("Get wallet transactions success", response);
        } catch (Exception e) {
            return httpResponseUtil.error("Error getting wallet transactions", e);
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

