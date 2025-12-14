package com.example.KLTN.Service;

import com.example.KLTN.Config.HTTPstatus.HttpResponseUtil;
import com.example.KLTN.Entity.*;
import com.example.KLTN.Repository.BookingRepository;
import com.example.KLTN.Repository.PaymentResultRepository;
import com.example.KLTN.Service.Impl.BookingServiceImpl;
import com.example.KLTN.dto.Apireponsi;
import com.example.KLTN.dto.BookingCreateDTO;
import com.example.KLTN.dto.PageResponse;
import com.google.zxing.WriterException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
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
    
    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

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
        // Tạo URL để quét QR code mở trang thông tin đẹp
        String qrUrl = frontendUrl + "/qr/" + booking.getId();
        
        // Vẫn giữ thông tin text để có thể đọc trực tiếp nếu cần
        String qrString = "THÔNG TIN ĐẶT PHÒNG\n" +
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
            LocalTime checkInTime = dto.getCheckInTime();
            LocalTime checkOutTime = dto.getCheckOutTime();
            
            // Kiểm tra check-in phải từ tương lai (ít nhất là hôm nay)
            if (checkIn == null) {
                return httpResponseUtil.badRequest("Ngày check-in không được để trống");
            }
            if (checkIn.isBefore(today)) {
                return httpResponseUtil.badRequest("Ngày check-in phải từ hôm nay trở đi, không được là ngày quá khứ");
            }
            
            // Kiểm tra check-out
            if (checkOut == null) {
                return httpResponseUtil.badRequest("Ngày check-out không được để trống");
            }
            if (checkOut.isBefore(checkIn)) {
                return httpResponseUtil.badRequest("Ngày check-out phải sau hoặc bằng ngày check-in");
            }
            
            // Set mặc định giờ check-in nếu không có
            if (checkInTime == null) {
                checkInTime = LocalTime.of(14, 0); // Mặc định 14:00 (chỉ khi user không chọn)
            }
            
            // Set mặc định giờ check-out nếu không có
            if (checkOutTime == null) {
                checkOutTime = LocalTime.of(11, 0); // Mặc định 11:00
            }
            
            // Kiểm tra số ngày: không được quá 1 ngày
            long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(checkIn, checkOut);
            if (checkOut.isEqual(checkIn)) {
                // Cùng ngày: checkOutTime phải sau checkInTime
                if (checkOutTime.isBefore(checkInTime) || checkOutTime.equals(checkInTime)) {
                    return httpResponseUtil.badRequest("Nếu cùng ngày, giờ check-out phải sau giờ check-in");
                }
            } else if (daysBetween == 1) {
                // Khác ngày 1 ngày: checkOutTime phải <= checkInTime để không quá 1 ngày
                // Ví dụ: check-in 11h ngày 17, check-out phải <= 11h ngày 18 (đủ 1 ngày, không quá)
                if (checkOutTime.isAfter(checkInTime)) {
                    return httpResponseUtil.badRequest(
                        String.format("Để đảm bảo không quá 1 ngày, giờ check-out phải trước hoặc bằng %02d:%02d (giờ check-in)",
                            checkInTime.getHour(), checkInTime.getMinute())
                    );
                }
            } else if (daysBetween > 1) {
                // Nhiều hơn 1 ngày: checkOutTime phải <= checkInTime để đảm bảo đủ số ngày
                if (checkOutTime.isAfter(checkInTime)) {
                    return httpResponseUtil.badRequest(
                        String.format("Để đảm bảo đủ %d ngày, giờ check-out phải trước hoặc bằng %02d:%02d (giờ check-in)",
                            daysBetween, checkInTime.getHour(), checkInTime.getMinute())
                    );
                }
            }
            
            // Kiểm tra xem có booking nào check-out vào ngày check-in không
            // Nếu có, tính thời gian dọn phòng = checkOutTime + 2-3h
            List<BookingEntity> bookingsCheckOutOnCheckInDate = bookingRepository.findBookingsCheckOutOnCheckInDate(
                rooms.getId(), 
                checkIn
            );
            
            // Tìm booking check-out muộn nhất vào ngày check-in
            LocalTime latestCheckOutTime = null;
            if (bookingsCheckOutOnCheckInDate != null && !bookingsCheckOutOnCheckInDate.isEmpty()) {
                for (BookingEntity booking : bookingsCheckOutOnCheckInDate) {
                    if (booking.getCheckOutTime() != null) {
                        if (latestCheckOutTime == null || booking.getCheckOutTime().isAfter(latestCheckOutTime)) {
                            latestCheckOutTime = booking.getCheckOutTime();
                        }
                    }
                }
            }
            
            // Tính giờ check-in tối thiểu
            // Chỉ validate nếu có booking check-out cùng ngày: minCheckInTime = latestCheckOutTime + 3h (thời gian dọn phòng 2-3h)
            // Nếu không có booking check-out cùng ngày: cho phép chọn bất kỳ giờ nào
            if (latestCheckOutTime != null) {
                // Thời gian dọn phòng = checkOutTime + 3h (lấy 3h để an toàn)
                LocalTime minCheckInTime = latestCheckOutTime.plusHours(3);
                // Nếu sau 24h, chuyển sang ngày hôm sau (nhưng vẫn check cùng ngày)
                if (minCheckInTime.isBefore(latestCheckOutTime)) {
                    minCheckInTime = LocalTime.of(23, 59); // Tối đa trong ngày
                }
                
                // Kiểm tra giờ check-in phải từ giờ tối thiểu trở đi (chỉ khi có booking check-out cùng ngày)
                if (checkInTime.isBefore(minCheckInTime)) {
                    String message = String.format("Giờ check-in phải từ %02d:%02d trở đi vì có booking check-out lúc %02d:%02d (cần 2-3 giờ dọn phòng)",
                        minCheckInTime.getHour(), minCheckInTime.getMinute(),
                        latestCheckOutTime.getHour(), latestCheckOutTime.getMinute());
                    return httpResponseUtil.badRequest(message);
                }
            }
            // Nếu không có booking check-out cùng ngày, cho phép chọn bất kỳ giờ nào
            
            // Kiểm tra phòng có available không (status = AVAILABLE)
            if (rooms.getStatus() != RoomsEntity.Status.AVAILABLE) {
                return httpResponseUtil.badRequest("Phòng này hiện không khả dụng (đang bảo trì hoặc đã được đặt)");
            }
            
            // Kiểm tra phòng có bị book trong khoảng thời gian này không (tính cả giờ)
            // Lấy tất cả bookings của room để kiểm tra overlap chi tiết
            List<BookingEntity> existingBookings = bookingRepository.findByRoomId(rooms.getId());
            
            // Tìm booking overlap và tính giờ check-in tối thiểu (tìm booking có check-out muộn nhất)
            LocalDate latestOverlapCheckOutDate = null;
            LocalTime latestOverlapCheckOutTime = null;
            
            // Kiểm tra overlap với từng booking
            for (BookingEntity existingBooking : existingBookings) {
                if (existingBooking.getStatus() != BookingEntity.BookingStatus.PENDING && 
                    existingBooking.getStatus() != BookingEntity.BookingStatus.PAID) {
                    continue; // Bỏ qua booking không active
                }
                
                LocalDate existingCheckIn = existingBooking.getCheckInDate();
                LocalDate existingCheckOut = existingBooking.getCheckOutDate();
                LocalTime existingCheckInTime = existingBooking.getCheckInTime() != null 
                    ? existingBooking.getCheckInTime() : LocalTime.of(14, 0);
                LocalTime existingCheckOutTime = existingBooking.getCheckOutTime() != null 
                    ? existingBooking.getCheckOutTime() : LocalTime.of(11, 0);
                
                // Kiểm tra overlap: 
                // 1. Nếu check-out của booking cũ < check-in của booking mới (cả date và time) -> OK
                // 2. Nếu check-in của booking cũ > check-out của booking mới (cả date và time) -> OK
                // 3. Nếu cùng ngày check-out = check-in, cần kiểm tra thời gian dọn phòng
                
                boolean isOverlap = false;
                
                // Trường hợp 1: Booking mới check-in trước khi booking cũ check-out
                if (checkIn.isBefore(existingCheckOut) || 
                    (checkIn.isEqual(existingCheckOut) && checkInTime.isBefore(existingCheckOutTime.plusHours(3)))) {
                    // Cần kiểm tra xem booking mới có check-out sau khi booking cũ check-in không
                    if (checkOut.isAfter(existingCheckIn) || 
                        (checkOut.isEqual(existingCheckIn) && checkOutTime.isAfter(existingCheckInTime))) {
                        isOverlap = true;
                    }
                }
                
                // Trường hợp 2: Booking mới check-out sau khi booking cũ check-in
                if (checkOut.isAfter(existingCheckIn) || 
                    (checkOut.isEqual(existingCheckIn) && checkOutTime.isAfter(existingCheckInTime))) {
                    // Cần kiểm tra xem booking mới có check-in trước khi booking cũ check-out không
                    if (checkIn.isBefore(existingCheckOut) || 
                        (checkIn.isEqual(existingCheckOut) && checkInTime.isBefore(existingCheckOutTime.plusHours(3)))) {
                        isOverlap = true;
                    }
                }
                
                if (isOverlap) {
                    // Tìm booking có check-out muộn nhất để tính giờ check-in tối thiểu
                    if (latestOverlapCheckOutDate == null || 
                        existingCheckOut.isAfter(latestOverlapCheckOutDate) ||
                        (existingCheckOut.isEqual(latestOverlapCheckOutDate) && 
                         existingCheckOutTime.isAfter(latestOverlapCheckOutTime))) {
                        latestOverlapCheckOutDate = existingCheckOut;
                        latestOverlapCheckOutTime = existingCheckOutTime;
                    }
                }
            }
            
            // Nếu có overlap, tính giờ check-in tối thiểu và trả về thông báo
            if (latestOverlapCheckOutDate != null && latestOverlapCheckOutTime != null) {
                // Tính giờ check-in tối thiểu: checkOutTime + 2h
                LocalTime minCheckInTimeFromOverlap = latestOverlapCheckOutTime.plusHours(2);
                LocalDate minCheckInDate = latestOverlapCheckOutDate;
                
                // Nếu sau 24h, chuyển sang ngày hôm sau
                if (minCheckInTimeFromOverlap.isBefore(latestOverlapCheckOutTime)) {
                    minCheckInDate = latestOverlapCheckOutDate.plusDays(1);
                    minCheckInTimeFromOverlap = LocalTime.of(0, 0);
                }
                
                String message;
                if (minCheckInDate.isEqual(checkIn)) {
                    // Cùng ngày check-in, chỉ cần hiển thị giờ
                    message = String.format("Vui lòng chọn giờ check-in từ %02d:%02d trở đi (cần 2 giờ dọn phòng sau booking trước)",
                        minCheckInTimeFromOverlap.getHour(), minCheckInTimeFromOverlap.getMinute());
                } else {
                    // Khác ngày, hiển thị cả ngày và giờ
                    message = String.format("Vui lòng chọn check-in từ ngày %s lúc %02d:%02d trở đi (cần 2 giờ dọn phòng sau booking trước)",
                        minCheckInDate, minCheckInTimeFromOverlap.getHour(), minCheckInTimeFromOverlap.getMinute());
                }
                return httpResponseUtil.badRequest(message);
            }
            
            // Tính số ngày và giá
            long days = java.time.temporal.ChronoUnit.DAYS.between(checkIn, checkOut);
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
            booking.setCheckInTime(checkInTime);
            booking.setCheckOutTime(checkOutTime);
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
    
    public ResponseEntity<Apireponsi<PageResponse<BookingEntity>>> getBookingHistoryByUserPaginated(int page, int size) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            UsersEntity user = userService.FindByUsername(username);
            if (user == null) {
                return httpResponseUtil.notFound("User not found");
            }
            
            // Validate và set defaults
            int validPage = page >= 0 ? page : 0;
            int validSize = size > 0 ? size : 8;
            
            Pageable pageable = PageRequest.of(validPage, validSize);
            Page<BookingEntity> bookingPage = bookingRepository.findByUserOrderByBookingDateDesc(user, pageable);
            
            PageResponse<BookingEntity> response = new PageResponse<>(
                bookingPage.getContent(),
                bookingPage.getTotalPages(),
                bookingPage.getTotalElements(),
                bookingPage.getNumber(),
                bookingPage.getSize(),
                bookingPage.hasNext(),
                bookingPage.hasPrevious()
            );
            
            return httpResponseUtil.ok("Get booking history success", response);
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
    
    // Lấy giờ check-in tối thiểu cho một room vào ngày cụ thể
    // Nếu có booking check-out vào ngày đó, thì check-in = checkOutTime + 3h (thời gian dọn phòng 2-3h)
    // Nếu không có, cho phép chọn bất kỳ giờ nào (không bắt buộc 14:00)
    public ResponseEntity<Apireponsi<java.util.Map<String, Object>>> getMinCheckInTime(Long roomId, LocalDate checkInDate) {
        try {
            List<BookingEntity> bookingsCheckOutOnCheckInDate = bookingRepository.findBookingsCheckOutOnCheckInDate(roomId, checkInDate);
            
            // Tìm booking check-out muộn nhất vào ngày check-in
            LocalTime latestCheckOutTime = null;
            if (bookingsCheckOutOnCheckInDate != null && !bookingsCheckOutOnCheckInDate.isEmpty()) {
                for (BookingEntity booking : bookingsCheckOutOnCheckInDate) {
                    if (booking.getCheckOutTime() != null) {
                        if (latestCheckOutTime == null || booking.getCheckOutTime().isAfter(latestCheckOutTime)) {
                            latestCheckOutTime = booking.getCheckOutTime();
                        }
                    }
                }
            }
            
            java.util.Map<String, Object> result = new java.util.HashMap<>();
            result.put("hasCheckoutOnSameDate", latestCheckOutTime != null);
            
            if (latestCheckOutTime != null) {
                // Tính giờ check-in tối thiểu = checkOutTime + 3h (thời gian dọn phòng)
                LocalTime minCheckInTime = latestCheckOutTime.plusHours(3);
                // Nếu sau 24h, giới hạn ở 23:59
                if (minCheckInTime.isBefore(latestCheckOutTime)) {
                    minCheckInTime = LocalTime.of(23, 59);
                }
                
                String minCheckInTimeStr = String.format("%02d:%02d", minCheckInTime.getHour(), minCheckInTime.getMinute());
                String latestCheckOutTimeStr = String.format("%02d:%02d", latestCheckOutTime.getHour(), latestCheckOutTime.getMinute());
                
                result.put("minCheckInTime", minCheckInTimeStr);
                result.put("latestCheckOutTime", latestCheckOutTimeStr);
                result.put("message", String.format("Có booking check-out lúc %s vào ngày này, check-in phải từ %s trở đi (cần 2-3 giờ dọn phòng)",
                    latestCheckOutTimeStr, minCheckInTimeStr));
            } else {
                // Không có booking check-out cùng ngày: cho phép chọn bất kỳ giờ nào
                result.put("minCheckInTime", "00:00"); // Không giới hạn
                result.put("message", "Bạn có thể chọn bất kỳ giờ nào (không có booking check-out cùng ngày)");
            }
            
            return httpResponseUtil.ok("Get min check-in time success", result);
        } catch (Exception e) {
            return httpResponseUtil.error("Error getting min check-in time", e);
        }
    }
    
    // Lấy booking theo ID (cho phép public để quét QR code)
    public ResponseEntity<Apireponsi<BookingEntity>> getBookingById(Long id) {
        try {
            BookingEntity booking = bookingRepository.findById(id).orElse(null);
            if (booking == null) {
                return httpResponseUtil.notFound("Không tìm thấy đặt phòng");
            }
            
            // Nếu có authentication, kiểm tra quyền
            try {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication != null && authentication.isAuthenticated() && !authentication.getName().equals("anonymousUser")) {
                    String username = authentication.getName();
                    UsersEntity user = userService.FindByUsername(username);
                    if (user != null) {
                        // Kiểm tra quyền: chỉ user sở hữu booking hoặc ADMIN mới được xem
                        boolean isOwner = booking.getUser() != null && booking.getUser().getId().equals(user.getId());
                        boolean isAdmin = user.getRole() != null && user.getRole().getName() != null 
                            && (user.getRole().getName().equals("ROLE_ADMIN") || user.getRole().getName().equals("ADMIN"));
                        
                        if (!isOwner && !isAdmin) {
                            // Nếu không có quyền nhưng booking đã thanh toán, vẫn cho xem (để quét QR)
                            if (booking.getStatus() != BookingEntity.BookingStatus.PAID) {
                                return httpResponseUtil.badRequest("Không có quyền xem đặt phòng này");
                            }
                        }
                    }
                }
            } catch (Exception e) {
                // Nếu không có authentication hoặc lỗi, vẫn cho phép xem nếu booking đã thanh toán (để quét QR)
                if (booking.getStatus() != BookingEntity.BookingStatus.PAID) {
                    return httpResponseUtil.badRequest("Chưa đăng nhập và đặt phòng chưa thanh toán");
                }
            }
            
            return httpResponseUtil.ok("Lấy thông tin đặt phòng thành công", booking);
        } catch (Exception e) {
            return httpResponseUtil.error("Lỗi khi lấy thông tin đặt phòng", e);
        }
    }
}
