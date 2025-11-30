package com.example.KLTN.Service;

import com.example.KLTN.Config.HTTPstatus.HttpResponseUtil;
import com.example.KLTN.Entity.*;
import com.example.KLTN.Repository.BookingRepository;
import com.example.KLTN.Repository.PaymentResultRepository;
import com.example.KLTN.Service.Impl.BookingServiceImpl;
import com.example.KLTN.dto.Apireponsi;
import com.example.KLTN.dto.BookingCreateDTO;
import com.google.zxing.WriterException;

import jakarta.servlet.http.HttpServletRequest;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
    private final VnpayService vnpayService;

    // --- Update nextAvailableDate cho room ---
    public void updateNextAvailableDate(Long roomId) {
        List<BookingEntity> bookings = bookingRepository.findByRoomsIdAndStatusIn(
                roomId,
                List.of(BookingEntity.BookingStatus.PENDING, BookingEntity.BookingStatus.PAID));

        LocalDate nextAvailable = LocalDate.now();

        if (!bookings.isEmpty()) {
            LocalDate maxCheckOut = bookings.stream()
                    .map(BookingEntity::getCheckOutDate)
                    .max(LocalDate::compareTo)
                    .orElse(LocalDate.now());

            nextAvailable = maxCheckOut.plusDays(1);
        }

        RoomsEntity room = roomsService.findRoomById(roomId);
        if (room != null) {
            room.setNextAvailableDate(nextAvailable);
            roomsService.saveRooms(room);
        }
    }

    @Override
    public BookingEntity findByid(Long id) {
        return bookingRepository.findById(id).orElse(null);
    }

    @Override
    public void saveBooking(BookingEntity booking) {
        bookingRepository.save(booking);
        updateNextAvailableDate(booking.getRooms().getId());
    }

    // --- Thanh toán bằng ví nội bộ ---
    @Transactional(rollbackOn = Exception.class)
    public ResponseEntity<Apireponsi<BookingEntity>> payBooking(Long id) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            UsersEntity user = userService.FindByUsername(username);
            BookingEntity booking = bookingRepository.findById(id).orElse(null);

            if (booking == null)
                return httpResponseUtil.notFound("Booking not found");
            if (user == null)
                return httpResponseUtil.notFound("User not found");
            if (!user.equals(booking.getUser()))
                return httpResponseUtil.badRequest("Không có quyền thanh toán");
            if (user.getWallet().getBalance().compareTo(booking.getTotalPrice()) < 0)
                return httpResponseUtil.badRequest("Số tiền không đủ thanh toán");
            if (!booking.getStatus().equals(BookingEntity.BookingStatus.PENDING))
                return httpResponseUtil.badRequest("Booking đã được xử lí");

            // Thanh toán
            BigDecimal newBalance = user.getWallet().getBalance().subtract(booking.getTotalPrice());
            booking.setStatus(BookingEntity.BookingStatus.PAID);
            user.getWallet().setBalance(newBalance);
            userService.SaveUser(user);

            walletTransactionService.CreateWalletTransactionUUser(
                    user,
                    Double.parseDouble(newBalance.toString()),
                    "Thanh Toán Booking",
                    WalletTransactionEntity.TransactionType.PAYMENT);

            // QR code
            String qrFileName = "qr_booking_" + booking.getId();
            qrCodeService.generateQrToFile(this.createContentQr(user, booking), qrFileName);
            booking.setQrUrl("/uploads/qr/" + qrFileName + ".png");

            bookingRepository.save(booking);
            createBookingAndPaymentResult(booking);

            return httpResponseUtil.ok("Payment Success", booking);
        } catch (WriterException | IOException e) {
            return httpResponseUtil.error("payBooking error", e);
        }
    }

    public String createContentQr(UsersEntity user, BookingEntity booking) {
        return "Name: " + user.getUsername() +
                "\nKhách Sạn: " + booking.getHotel().getName() +
                "\nĐịa chỉ: " + booking.getHotel().getAddress() +
                "\nPhòng: " + booking.getRooms().getNumber() +
                "\nCheck-in: " + booking.getCheckInDate() +
                "\nCheck-out: " + booking.getCheckOutDate() +
                "\nSố người: " + booking.getRooms().getCapacity() +
                "\nGiá Phòng: " + booking.getTotalPrice() +
                "\nThanh Toán: Đã Thanh toán";
    }

    public Long extractBookingId(String orderInfo) {
        try {
            String[] parts = orderInfo.split("\\|");
            for (String s : parts) {
                if (s.startsWith("bookingId:")) {
                    return Long.parseLong(s.replace("bookingId:", "").trim());
                }
            }
        } catch (Exception ignored) {
        }
        return null;
    }

    @Transactional
    public ResponseEntity<Apireponsi<PaymentResultEntity>> createBookingAndPaymentResult(BookingEntity newBooking) {
        BookingEntity booking = bookingRepository.save(newBooking);

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

        updateNextAvailableDate(booking.getRooms().getId());

        return httpResponseUtil.created("Payment Success", paymentResult);
    }

    // --- Thanh toán bằng VNPAY ---
    @Transactional
    public ResponseEntity<Apireponsi<String>> payBookingViaVnpay(Long bookingId, HttpServletRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            UsersEntity user = userService.FindByUsername(auth.getName());
            BookingEntity booking = bookingRepository.findById(bookingId).orElse(null);

            if (booking == null)
                return httpResponseUtil.notFound("Booking không tồn tại");
            if (user == null)
                return httpResponseUtil.notFound("User không tồn tại");
            if (!booking.getUser().equals(user))
                return httpResponseUtil.badRequest("Không có quyền thanh toán");
            if (!booking.getStatus().equals(BookingEntity.BookingStatus.PENDING))
                return httpResponseUtil.badRequest("Booking đã được xử lý");

            long amountVnpay = booking.getTotalPrice().multiply(new BigDecimal(100)).longValue();
            String orderInfo = "bookingId:" + booking.getId() + "|userId:" + user.getId();
            String vnpayUrl = vnpayService.createRedirectUrl(request, amountVnpay, orderInfo, "billpayment");

            return httpResponseUtil.ok("Redirect sang VNPAY", vnpayUrl);
        } catch (Exception e) {
            return httpResponseUtil.error("payBookingViaVnpay error", e);
        }
    }

    @Transactional
    public ResponseEntity<Apireponsi<BookingEntity>> handleVnpayReturn(HttpServletRequest request) {
        try {
            Map<String, String> params = new HashMap<>();
            request.getParameterMap().forEach((k, v) -> params.put(k, v[0]));

            boolean valid = vnpayService.validateReturn(params);
            String responseCode = params.get("vnp_ResponseCode");
            String orderInfo = params.get("vnp_OrderInfo");

            Long bookingId = extractBookingId(orderInfo);
            if (bookingId == null)
                return httpResponseUtil.badRequest("Không tìm được bookingId từ orderInfo");

            BookingEntity booking = this.findByid(bookingId);
            if (booking == null)
                return httpResponseUtil.notFound("Booking không tồn tại");

            if (valid && "00".equals(responseCode)) {
                booking.setStatus(BookingEntity.BookingStatus.PAID);

                String qrFileName = "qr_booking_" + booking.getId();
                qrCodeService.generateQrToFile(this.createContentQr(booking.getUser(), booking), qrFileName);
                booking.setQrUrl("/uploads/qr/" + qrFileName + ".png");

                this.saveBooking(booking);
                this.createBookingAndPaymentResult(booking);

                return httpResponseUtil.ok("Thanh toán thành công qua VNPAY", booking);
            } else {
                return httpResponseUtil.badRequest("Thanh toán thất bại. Mã lỗi: " + responseCode);
            }
        } catch (IOException | WriterException e) {
            return httpResponseUtil.error("handleVnpayReturn error", e);
        }
    }

    // --- Tạo booking ---
    @Override
    public ResponseEntity<Apireponsi<BookingEntity>> createBooking(Long roomId, BookingCreateDTO dto) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            UsersEntity user = userService.FindByUsername(username);
            if (user == null)
                return httpResponseUtil.notFound("User not found");

            RoomsEntity room = roomsService.findRoomById(roomId);
            if (room == null)
                return httpResponseUtil.notFound("Room not found");

            HotelEntity hotel = room.getHotel();
            if (hotel == null)
                return httpResponseUtil.notFound("Hotel not found");

            if (hotel.getStatus().equals(HotelEntity.Status.pending))
                return httpResponseUtil.badRequest("Hotel chưa được phép kinh doanh");

            LocalDate today = LocalDate.now();
            LocalDate checkIn = dto.getCheckInDate();
            LocalDate checkOut = dto.getCheckOutDate();

            if (checkIn == null)
                return httpResponseUtil.badRequest("Ngày check-in không được để trống");
            if (checkIn.isBefore(today))
                return httpResponseUtil.badRequest("Ngày check-in phải từ hôm nay trở đi");

            if (checkOut == null)
                return httpResponseUtil.badRequest("Ngày check-out không được để trống");
            if (!checkOut.isAfter(checkIn))
                return httpResponseUtil.badRequest("Ngày check-out phải sau ngày check-in");

            if (room.getStatus() != RoomsEntity.Status.AVAILABLE)
                return httpResponseUtil.badRequest("Phòng hiện không khả dụng");

            Long bookingCount = bookingRepository.countBookingsForRoomInDateRange(room.getId(), checkIn, checkOut);
            if (bookingCount != null && bookingCount > 0)
                return httpResponseUtil.badRequest(
                        "Phòng đã được đặt từ " + checkIn + " đến " + checkOut);

            long days = ChronoUnit.DAYS.between(checkIn, checkOut);
            if (days <= 0)
                days = 1;

            Double payment = room.getPrice() - (room.getPrice() * room.getDiscountPercent());
            payment *= days;
            BigDecimal totalPrice = BigDecimal.valueOf(payment);

            BookingEntity booking = new BookingEntity();
            booking.setRooms(room);
            booking.setHotel(hotel);
            booking.setUser(user);
            booking.setBookingDate(LocalDateTime.now());
            booking.setCheckInDate(checkIn);
            booking.setCheckOutDate(checkOut);
            booking.setTotalPrice(totalPrice);
            booking.setStatus(BookingEntity.BookingStatus.PENDING);

            bookingRepository.save(booking);
            updateNextAvailableDate(room.getId());

            return httpResponseUtil.created("Đặt phòng thành công", booking);
        } catch (Exception e) {
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
            if (user == null)
                return httpResponseUtil.notFound("User not found");

            List<BookingEntity> bookings = bookingRepository.findByUserOrderByBookingDateDesc(user);
            return httpResponseUtil.ok("Get booking history success", bookings);
        } catch (Exception e) {
            e.printStackTrace();
            return httpResponseUtil.error("Get booking history error", e);
        }
    }

    public ResponseEntity<Apireponsi<List<BookingEntity>>> getBookingsByRoom(Long roomId) {
        try {
            List<BookingEntity> bookings = bookingRepository.findBookingsByRoomId(roomId);
            return httpResponseUtil.ok("Get bookings by room success", bookings);
        } catch (Exception e) {
            return httpResponseUtil.error("Error getting bookings by room", e);
        }
    }
}
