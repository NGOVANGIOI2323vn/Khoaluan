package com.example.KLTN.Service;


import com.example.KLTN.Config.HTTPstatus.HttpResponseUtil;
import com.example.KLTN.Entity.UsersEntity;
import com.example.KLTN.Entity.WalletTransactionEntity;
import com.example.KLTN.Entity.WalletsEntity;
import com.example.KLTN.Entity.withDrawHistoryEntity;
import com.example.KLTN.Repository.withdrawhistoryRepository;
import com.example.KLTN.Service.Impl.withdrawhistoryServiceImpl;
import com.example.KLTN.dto.Apireponsi;
import com.example.KLTN.dto.withDrawDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
@Service
@RequiredArgsConstructor
public class withdrawhistoryService implements withdrawhistoryServiceImpl {
    private final UserService userService;
    private final WalletService wallettService;
    private final HttpResponseUtil httpResponseUtil;
    private final WalletTransactionService walletTransactionService;

    @Override
    public ResponseEntity<Apireponsi<withDrawHistoryEntity>> createWithdraw(withDrawDTO dto) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            UsersEntity user = userService.FindByUsername(username);
            WalletsEntity wallet = wallettService.GetWallet(user);

            if (wallet == null) {
                return httpResponseUtil.badRequest("Không tồn tại ví");
            }

            BigDecimal amount = BigDecimal.valueOf(dto.getAmount());
            if (wallet.getBalance().compareTo(amount) < 0) {
                return httpResponseUtil.badRequest("Số tiền không đủ");
            }

            withDrawHistoryEntity withdraw = new withDrawHistoryEntity();
            withdraw.setAmount(dto.getAmount());
            withdraw.setCreate_AT(LocalDateTime.now());
            withdraw.setUpdate_AT(null);
            withdraw.setBankName(dto.getBankName());
            withdraw.setAccountNumber(dto.getAccountNumber());
            withdraw.setAccountHolderName(dto.getAccountHolderName());
            withdraw.setWalletsEntity(wallet);
            withdraw.setStatus(withDrawHistoryEntity.Status.pending);

            saveWithdraw(withdraw);
            return httpResponseUtil.created("Tạo mới thành công giao dịch", withdraw);
        } catch (Exception e) {
            return httpResponseUtil.error("Create Error", e);
        }
    }
    @Override
    public ResponseEntity<Apireponsi<withDrawHistoryEntity>> approveWithdraw(Long id) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            UsersEntity user = userService.FindByUsername(username);
            withDrawHistoryEntity withdraw = findByid(id);
            if (withdraw == null) {
                return httpResponseUtil.badRequest("Không tồn tại WithdrawHistory");
            }
            if (withdraw.getStatus() != withDrawHistoryEntity.Status.pending) {
                return httpResponseUtil.badRequest("Giao dịch đã được xử lý");
            }

            WalletsEntity wallet = withdraw.getWalletsEntity();
            BigDecimal amount = BigDecimal.valueOf(withdraw.getAmount());

            if (wallet.getBalance().compareTo(amount) < 0) {
                return httpResponseUtil.badRequest("Số tiền không đủ để rút");
            }

            wallet.setBalance(wallet.getBalance().subtract(amount));
            withdraw.setStatus(withDrawHistoryEntity.Status.resolved);
            withdraw.setUpdate_AT(LocalDateTime.now());
            saveWithdraw(withdraw);
            walletTransactionService.CreateWalletTransactionUUser(user, withdraw.getAmount(), "Rút Tiền", WalletTransactionEntity.TransactionType.PAYMENT);
            return httpResponseUtil.ok("Đã phê duyệt rút tiền");
        } catch (Exception e) {
            return httpResponseUtil.error("Approve Error", e);
        }
    }
    @Override
    public ResponseEntity<Apireponsi<withDrawHistoryEntity>> rejectWithdraw(Long id) {
        try {
            withDrawHistoryEntity withdraw = findByid(id);
            if (withdraw == null) {
                return httpResponseUtil.badRequest("Không tồn tại WithdrawHistory");
            }
            if (withdraw.getStatus() != withDrawHistoryEntity.Status.pending) {
                return httpResponseUtil.badRequest("Giao dịch đã được xử lý");
            }

            withdraw.setStatus(withDrawHistoryEntity.Status.refuse);
            withdraw.setUpdate_AT(LocalDateTime.now());
            saveWithdraw(withdraw);

            return httpResponseUtil.ok("Đã từ chối phê duyệt");
        } catch (Exception e) {
            return httpResponseUtil.error("Reject Error", e);
        }
    }
// ====================================================================================//
    @Override
    public withDrawHistoryEntity findByid(Long id) {
        return withdrawRepository.findById(id).orElse(null);
    }


    private final withdrawhistoryRepository withdrawRepository;
    @Override
    public void saveWithdraw(withDrawHistoryEntity withdraw) {
        withdrawRepository.save(withdraw);
    }

    @Override
    public List<withDrawHistoryEntity> findAllWithdrawHistory() {
        return withdrawRepository.findAll();
    }
}
