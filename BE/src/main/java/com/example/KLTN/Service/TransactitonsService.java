package com.example.KLTN.Service;

import com.example.KLTN.Entity.TransactitonsEntity;
import com.example.KLTN.Entity.UsersEntity;
import com.example.KLTN.Entity.WalletTransactionEntity;
import com.example.KLTN.Entity.WalletsEntity;
import com.example.KLTN.Repository.TransactitonsRepository;
import com.example.KLTN.Service.Impl.TransactitonsServiceImpl;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@RequiredArgsConstructor
@Service
public class TransactitonsService implements TransactitonsServiceImpl {
    private final UserService userService;
    private final WalletService walletService;
    private final TransactitonsRepository transactitonsRepository;
    private final WalletTransactionService walletTransactionService;


    // ================== Callback Failed ==================
    @Override
    @Transactional
    public void failedPayment(HttpServletRequest request) {
        String vnpTxnRef = request.getParameter("vnp_TxnRef");
        String orderInfo = request.getParameter("vnp_OrderInfo");
        String amountStr = request.getParameter("vnp_Amount");
        Long id = null;
        if (orderInfo.contains("|userId:")) {
            try {
                String[] parts = orderInfo.split("\\|userId:");
                id = Long.parseLong(parts[1]);
            } catch (Exception e) {
                System.err.println("⚠ Không parse được userId từ orderInfo: " + orderInfo);
            }
        }
        UsersEntity users = userService.findById(id);
        WalletsEntity wallets = walletService.GetWallet(users);
        if (amountStr == null || vnpTxnRef == null) {
            System.err.println("⚠ VNPay callback thất bại không đủ dữ liệu -> Bỏ qua lưu DB");
            return;
        }

        BigDecimal amount = new BigDecimal(amountStr).divide(BigDecimal.valueOf(100));
        TransactitonsEntity transactitons = new TransactitonsEntity();

        if (wallets == null) {
            System.err.println("⚠ Không tìm thấy giao dịch -> callback có thể đến từ VNPay server");
            return;
        }

        transactitons.setStatus(TransactitonsEntity.Status.failed);
        transactitons.setAmount(amount);
        transactitons.setVnpOrderInfo(orderInfo);
        transactitons.setCreatedAt(LocalDateTime.now());
        transactitons.setWallet(wallets);
        transactitons.setType(TransactitonsEntity.statustype.deposit);
        transactitons.setVnpTxnRef(vnpTxnRef);
        transactitonsRepository.save(transactitons);
    }

    @Override
    @Transactional
    public void SucseccPayment(HttpServletRequest request) {
        String vnpTxnRef = request.getParameter("vnp_TxnRef");
        String orderInfo = request.getParameter("vnp_OrderInfo");
        String amountStr = request.getParameter("vnp_Amount");
        double muoney = Double.parseDouble(amountStr.toString());
        Long id = null;
        if (orderInfo.contains("|userId:")) {
            try {
                String[] parts = orderInfo.split("\\|userId:");
                id = Long.parseLong(parts[1]);
            } catch (Exception e) {
                System.err.println("⚠ Không parse được userId từ orderInfo: " + orderInfo);
            }
        }
        UsersEntity users = userService.findById(id);
        WalletsEntity wallets = walletService.GetWallet(users);

        if (amountStr == null || vnpTxnRef == null) {
            System.err.println("⚠ VNPay callback thất bại không đủ dữ liệu -> Bỏ qua lưu DB");
            return;
        }

        BigDecimal amount = new BigDecimal(amountStr).divide(BigDecimal.valueOf(100));
        TransactitonsEntity transactitons = new TransactitonsEntity();


        wallets.setBalance(wallets.getBalance().add(amount));
        walletService.SaveWallet(wallets);
        transactitons.setStatus(TransactitonsEntity.Status.success);
        transactitons.setAmount(amount);
        transactitons.setVnpOrderInfo(orderInfo);
        transactitons.setCreatedAt(LocalDateTime.now());
        transactitons.setVnpTxnRef(vnpTxnRef);
        transactitons.setWallet(wallets);
        transactitons.setType(TransactitonsEntity.statustype.deposit);
        transactitonsRepository.save(transactitons);
        walletTransactionService.CreateWalletTransactionUUser(users, muoney, "Nạp tiền từ cổng vnpay", WalletTransactionEntity.TransactionType.DEPOSIT);
    }

    @Override
    public void SaveTransactions(TransactitonsEntity transactitonsEntity) {
        transactitonsRepository.save(transactitonsEntity);
    }
}
