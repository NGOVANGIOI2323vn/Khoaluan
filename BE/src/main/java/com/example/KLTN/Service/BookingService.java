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
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService implements BookingServiceImpl {


    private final BookingRepository bookingRepository;
    private final HttpResponseUtil httpResponseUtil;
    private final UserService userService;
    private final RoomsService roomsService;
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
            qrCodeService.generateQrToFile(this.createContentQr(user, booking), qrFileName);
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
                return httpResponseUtil.badRequest("Hotel Chưa được phép kinh doanh");
            }
            
            // Validate dates
            LocalDate today = LocalDate.now();
            LocalDate checkIn = dto.getCheckInDate();
            LocalDate checkOut = dto.getCheckOutDate();
            
            // Kiểm tra check-in phải từ tương lai (ít nhất là hôm nay)
            if (checkIn == null) {
                return httpResponseUtil.badRequest("Ngày check-in không được để trống");
            }
            if (checkIn.isBefore(today)) {
                return httpResponseUtil.badRequest("Ngày check-in phải từ hôm nay trở đi, không được là ngày quá khứ");
            }
            
            // Kiểm tra check-out phải sau check-in
            if (checkOut == null) {
                return httpResponseUtil.badRequest("Ngày check-out không được để trống");
            }
            if (checkOut.isBefore(checkIn) || checkOut.isEqual(checkIn)) {
                return httpResponseUtil.badRequest("Ngày check-out phải sau ngày check-in");
            }
            
            // Kiểm tra phòng có available không (status = AVAILABLE)
            if (rooms.getStatus() != RoomsEntity.Status.AVAILABLE) {
                return httpResponseUtil.badRequest("Phòng này hiện không khả dụng (đang bảo trì hoặc đã được đặt)");
            }
            
            // Kiểm tra phòng có bị book trong khoảng thời gian này không
            Long bookingCount = bookingRepository.countBookingsForRoomInDateRange(
                rooms.getId(), 
                checkIn, 
                checkOut
            );
            
            if (bookingCount != null && bookingCount > 0) {
                return httpResponseUtil.badRequest(
                    "Phòng này đã được đặt trong khoảng thời gian từ " + checkIn + " đến " + checkOut + 
                    ". Vui lòng chọn khoảng thời gian khác hoặc phòng khác."
                );
            }
            
            // Tính số ngày và giá
            long days = ChronoUnit.DAYS.between(checkIn, checkOut);
            if (days <= 0) {
                days = 1;
            }
            
            Double payment = rooms.getPrice() - (rooms.getPrice() * rooms.getDiscountPercent());
            payment *= days;
            BigDecimal paymentBigDecimal = new BigDecimal(payment);
            
            // Tạo booking
            BookingEntity booking = new BookingEntity();
            booking.setRooms(rooms);
            booking.setHotel(hotel);
            booking.setUser(user);
            booking.setBookingDate(LocalDateTime.now());
            booking.setCheckInDate(checkIn);
            booking.setCheckOutDate(checkOut);
            booking.setTotalPrice(paymentBigDecimal);
            booking.setStatus(BookingEntity.BookingStatus.PENDING);
            
            bookingRepository.save(booking);
            
            return httpResponseUtil.created("Đặt phòng thành công", booking);
        } catch (Exception e) {
            System.err.println("Error creating booking: " + e.getMessage());
            e.printStackTrace();
            return httpResponseUtil.error("Lỗi khi đặt phòng: " + e.getMessage(), e);
        }
    }

    @Override
    public ResponseEntity<Apireponsi<List<BookingEntity>>> getBookingHistoryByUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            UsersEntity user = userService.FindByUsername(username);
            if (user == null) {
                return httpResponseUtil.notFound("User not found");
            }
            List<BookingEntity> bookings = bookingRepository.findByUserOrderByBookingDateDesc(user);

            return httpResponseUtil.ok("Get booking history success", bookings);
        } catch (Exception e) {
            System.err.println("Error getting booking history: " + e.getMessage());
            e.printStackTrace();
            return httpResponseUtil.error("Get booking history error", e);
        }
    }
    
    // Lấy bookings của một room
    public ResponseEntity<Apireponsi<List<BookingEntity>>> getBookingsByRoom(Long roomId) {
        try {
            List<BookingEntity> bookings = bookingRepository.findByRoomId(roomId);
            return httpResponseUtil.ok("Get bookings by room success", bookings);
        } catch (Exception e) {
            return httpResponseUtil.error("Error getting bookings by room", e);
        }
    }
}
