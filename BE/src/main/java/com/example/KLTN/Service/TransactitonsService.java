package com.example.KLTN.Service;

import com.example.KLTN.Entity.*;
import com.example.KLTN.Repository.BookingRepository;
import com.example.KLTN.Repository.TransactitonsRepository;
import com.example.KLTN.Service.Impl.TransactitonsServiceImpl;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.google.zxing.WriterException;

@RequiredArgsConstructor
@Service
public class TransactitonsService implements TransactitonsServiceImpl {
    private final UserService userService;
    private final WalletService walletService;
    private final TransactitonsRepository transactitonsRepository;
    private final WalletTransactionService walletTransactionService;
    private final BookingRepository bookingRepository;
    private final Booking_transactionsService booking_transactionsService;
    private final QrCodeService qrCodeService;
    
    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;


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
        Long id = null;
        Long bookingId = null;
        
        // Parse userId từ orderInfo
        if (orderInfo != null && orderInfo.contains("|userId:")) {
            try {
                String[] parts = orderInfo.split("\\|userId:");
                id = Long.parseLong(parts[1].split("\\|")[0]);
            } catch (Exception e) {
                System.err.println("⚠ Không parse được userId từ orderInfo: " + orderInfo);
            }
        }
        
        // Parse bookingId từ orderInfo (nếu có)
        if (orderInfo != null && orderInfo.contains("|bookingId:")) {
            try {
                String[] parts = orderInfo.split("\\|bookingId:");
                if (parts.length > 1) {
                    bookingId = Long.parseLong(parts[1].split("\\|")[0]);
                }
            } catch (Exception e) {
                System.err.println("⚠ Không parse được bookingId từ orderInfo: " + orderInfo);
            }
        }
        
        UsersEntity users = userService.findById(id);
        if (users == null) {
            System.err.println("⚠ Không tìm thấy user với id: " + id);
            return;
        }
        
        WalletsEntity wallets = walletService.GetWallet(users);

        if (amountStr == null || vnpTxnRef == null) {
            System.err.println("⚠ VNPay callback thất bại không đủ dữ liệu -> Bỏ qua lưu DB");
            return;
        }

        BigDecimal amount = new BigDecimal(amountStr).divide(BigDecimal.valueOf(100));
        TransactitonsEntity transactitons = new TransactitonsEntity();

        // Nếu có bookingId, xử lý thanh toán booking
        if (bookingId != null) {
            try {
                BookingEntity booking = bookingRepository.findById(bookingId).orElse(null);
                if (booking != null && booking.getStatus() == BookingEntity.BookingStatus.PENDING) {
                    // Cập nhật booking status = PAID
                    booking.setStatus(BookingEntity.BookingStatus.PAID);
                    
                    // Tạo QR code
                    String qrFileName = "qr_booking_" + booking.getId();
                    try {
                        qrCodeService.generateQrToFile(createContentQr(users, booking), qrFileName);
                        booking.setQrUrl("/uploads/qr/" + qrFileName + ".png");
                    } catch (WriterException | IOException e) {
                        System.err.println("⚠ Lỗi tạo QR code: " + e.getMessage());
                    }
                    
                    bookingRepository.save(booking);
                    
                    // Tạo booking transaction (phân chia doanh thu)
                    booking_transactionsService.Create(booking);
                    
                    // Lưu transaction record
                    transactitons.setStatus(TransactitonsEntity.Status.success);
                    transactitons.setAmount(amount);
                    transactitons.setVnpOrderInfo(orderInfo);
                    transactitons.setCreatedAt(LocalDateTime.now());
                    transactitons.setVnpTxnRef(vnpTxnRef);
                    transactitons.setWallet(wallets);
                    transactitons.setType(TransactitonsEntity.statustype.deposit);
                    transactitonsRepository.save(transactitons);
                    
                    return;
                } else {
                    System.err.println("⚠ Booking không tìm thấy hoặc đã được xử lý: " + bookingId);
                }
            } catch (Exception e) {
                System.err.println("⚠ Lỗi xử lý booking payment: " + e.getMessage());
                e.printStackTrace();
            }
        }
        
        // Nếu không có bookingId hoặc booking không hợp lệ, xử lý như nạp tiền vào ví
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
        walletTransactionService.CreateWalletTransactionUUser(users, amount.doubleValue(), "Nạp tiền từ cổng vnpay", WalletTransactionEntity.TransactionType.DEPOSIT);
    }
    
    private String createContentQr(UsersEntity user, BookingEntity booking) {
        // Tạo URL để quét QR code mở trang thông tin đẹp
        String qrUrl = frontendUrl + "/qr/" + booking.getId();
        
        // Vẫn giữ thông tin text để có thể đọc trực tiếp nếu cần
        return "THÔNG TIN ĐẶT PHÒNG\n" +
                "Mã đặt phòng: #" + booking.getId() + "\n" +
                "Khách hàng: " + user.getUsername() + "\n" +
                "Khách Sạn: " + booking.getHotel().getName() + "\n" +
                "Địa chỉ: " + booking.getHotel().getAddress() + "\n" +
                "Phòng: " + booking.getRooms().getNumber() + "\n" +
                "Check-in: " + booking.getCheckInDate() + "\n" +
                "Check-out: " + booking.getCheckOutDate() + "\n" +
                "Số người: " + booking.getRooms().getCapacity() + "\n" +
                "Giá Phòng: " + booking.getTotalPrice() + " VND\n" +
                "Trạng thái: Đã thanh toán\n\n" +
                "Xem chi tiết: " + qrUrl;
    }

    @Override
    public void SaveTransactions(TransactitonsEntity transactitonsEntity) {
        transactitonsRepository.save(transactitonsEntity);
    }
}
