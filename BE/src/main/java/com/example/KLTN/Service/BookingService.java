package com.example.KLTN.Service;

import com.example.KLTN.Config.HTTPstatus.HttpResponseUtil;
import com.example.KLTN.Entity.*;
import com.example.KLTN.Repository.BookingRepository;
import com.example.KLTN.Repository.PaymentResultRepository;
import com.example.KLTN.Service.Impl.BookingServiceImpl;
import com.example.KLTN.dto.Apireponsi;
import com.example.KLTN.dto.BookingCreateDTO;
import com.google.zxing.WriterException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class BookingService implements BookingServiceImpl {


    private final BookingRepository bookingRepository;
    private final HttpResponseUtil httpResponseUtil;
    private final UserService userService;
    private final RoomsService roomsService;
    private final HotelService hotelService;
    private final QrCodeService qrCodeService;
    private final PaymentResultRepository paymentResultRepository;
    private final WalletTransactionService walletTransactionService;
    private final Booking_transactionsService booking_transactionsService;

    @Override
    public BookingEntity findByid(Long id) {
        return bookingRepository.findById(id).orElse(null);
    }

    @Override
    public void saveBooking(BookingEntity booking) {
        bookingRepository.save(booking);
    }

    @Transactional(rollbackOn = Exception.class)
    public ResponseEntity<Apireponsi<BookingEntity>> payBooking(Long id
    ) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            UsersEntity user = userService.FindByUsername(username);
            BookingEntity booking = bookingRepository.findById(id).orElse(null);
            if (booking == null) return httpResponseUtil.notFound("Booking not found");
            if (user == null) return httpResponseUtil.notFound("User not found");
            if (!user.equals(booking.getUser())) return httpResponseUtil.badRequest("Không có quyền thanh toán");
            if (user.getWallet().getBalance().compareTo(booking.getTotalPrice()) < 0)
                return httpResponseUtil.badRequest("Số tiền không đủ thanh toán");
            if (!booking.getStatus().equals(BookingEntity.BookingStatus.PENDING)) {
                return httpResponseUtil.badRequest("Booking đã được xử lí");
            }
            // Thanh toán
            BigDecimal newBalance = user.getWallet().getBalance().subtract(booking.getTotalPrice());
            booking.setStatus(BookingEntity.BookingStatus.PAID);
            user.getWallet().setBalance(newBalance);
            userService.SaveUser(user);
            double muoney = Double.parseDouble(newBalance.toString());
            walletTransactionService.CreateWalletTransactionUUser(user, muoney, "Thanh Toán Bookinng", WalletTransactionEntity.TransactionType.PAYMENT);
            // Nội dung QR code: toàn bộ thông tin booking
            String qrFileName = "qr_booking_" + booking.getId();
            Path qrFilePath = qrCodeService.generateQrToFile(this.createContentQr(user, booking), qrFileName);
            // Lưu đường dẫn QR vào DB
            booking.setQrUrl("/uploads/qr/" + qrFileName + ".png");
            bookingRepository.save(booking);
            createBookingAndPaymentResult(booking);
            // Trả về đường dẫn file QR (trong server)
            return httpResponseUtil.ok("Payment Success", booking);
        } catch (WriterException | IOException e) {
            return httpResponseUtil.error("payBooking error", e);
        }
    }

    public String createContentQr(UsersEntity user, BookingEntity booking) {
        String qrString = "Name: " + user.getUsername() +
                "\nKhách Sạn: " + booking.getHotel().getName() +
                "\nĐịa chỉ: " + booking.getHotel().getAddress() +
                "\nPhòng: " + booking.getRooms().getNumber() +
                "\nCheck-in: " + booking.getCheckInDate() +
                "\nCheck-out: " + booking.getCheckOutDate() +
                "\nSố người: " + booking.getRooms().getCapacity() +
                "\nGiá Phòng: " + booking.getTotalPrice() +
                "\nThanh Toán: " + "Đã Thanh toán";
        return qrString;
    }

    @Transactional
    public ResponseEntity<Apireponsi<PaymentResultEntity>> createBookingAndPaymentResult(BookingEntity newBooking) {
        // Lưu booking
        BookingEntity booking = bookingRepository.save(newBooking);
        // Tạo PaymentResult với trạng thái PENDING
        PaymentResultEntity paymentResult = PaymentResultEntity.builder()
                .user(booking.getUser())
                .booking(booking)
                .hotelName(booking.getHotel().getName())
                .hotelAddress(booking.getHotel().getAddress())
                .roomNumber(booking.getRooms().getNumber())
                .roomCapacity(booking.getRooms().getCapacity())
                .checkInDate(booking.getCheckInDate())
                .checkOutDate(booking.getCheckOutDate())
                .totalPrice(booking.getTotalPrice())
                .build();
        paymentResultRepository.save(paymentResult);
        booking_transactionsService.Create(booking);
        return httpResponseUtil.created("Payment Success", paymentResult);
    }

    @Override
    public ResponseEntity<Apireponsi<BookingEntity>> createBooking(Long id, BookingCreateDTO dto) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            UsersEntity user = userService.FindByUsername(username);
            if (user == null) {
                return httpResponseUtil.notFound("User not found");
            }
            RoomsEntity rooms = roomsService.findRoomById(id);
            if (rooms == null) {
                return httpResponseUtil.notFound("Room not found");
            }
            HotelEntity hotel = rooms.getHotel();
            if (hotel == null) {
                return httpResponseUtil.notFound("Hotel not found");
            }
            if (hotel.getStatus().equals(HotelEntity.Status.pending)) {
                return httpResponseUtil.notFound("Hotel Chưa được phép kinh doanh");
            }
            long days = ChronoUnit.DAYS.between(dto.getCheckInDate(), dto.getCheckOutDate());
            if (days <= 0) {
                days = 1;
            }
            Double payment = rooms.getPrice() - (rooms.getPrice() * rooms.getDiscountPercent());
            payment *= days;
            BigDecimal paymentBigDecimal = new BigDecimal(payment);
            BookingEntity booking = new BookingEntity();
            booking.setRooms(rooms);
            booking.setHotel(hotel);
            booking.setUser(user);
            booking.setBookingDate(LocalDateTime.now());
            booking.setCheckInDate(dto.getCheckInDate());
            booking.setCheckOutDate(dto.getCheckOutDate());
            booking.setTotalPrice(paymentBigDecimal);
            booking.setStatus(BookingEntity.BookingStatus.PENDING);
            bookingRepository.save(booking);
            return httpResponseUtil.created("Create booking Sucsess", booking);
        } catch (Exception e) {
            return httpResponseUtil.error("Error Create Booking ", e);
        }
    }
}
