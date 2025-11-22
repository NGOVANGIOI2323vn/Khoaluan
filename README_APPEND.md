## 🔧 Components và Utilities

### Frontend Components

#### Reusable Components
- **AppModal**: Modal component với header, body, footer, responsive
- **Header**: Global header với navigation, wallet display, booking filter
- **HotelCard**: Card hiển thị thông tin khách sạn (2 variants: default, dashboard)
- **HotelForm**: Form tạo/sửa khách sạn với validation
- **RoomForm**: Form tạo nhiều phòng cùng lúc với useFieldArray
- **RoomEditForm**: Form sửa thông tin phòng (type, capacity, discount, image)
- **WithdrawForm**: Form yêu cầu rút tiền với validation số tiền
- **AdminPercentForm**: Form cập nhật tỷ lệ admin percent
- **UploadImage**: Component upload ảnh với drag & drop, preview
- **FormattedNumberInput**: Input số tự động format (1.000.000 VND)
- **ProtectedRoute**: Route protection theo role
- **ChatBox**: AI chat interface (hiển thị ở tất cả trang)
- **GoogleMap**: Google Maps component với markers
- **Toast**: Toast notification component

#### Pages
- **Home**: Trang chủ với hero section, search form, featured hotels
- **HotelList**: Danh sách khách sạn với filter, search, pagination
- **HotelDetail**: Chi tiết khách sạn với tabs, image gallery, reviews
- **Booking**: Trang đặt phòng với date picker, room selection
- **Checkout**: Trang thanh toán với VNPay integration
- **Login**: Trang đăng nhập với Google OAuth2
- **Register**: Trang đăng ký với role selection
- **VerifyOtp**: Trang xác thực OTP
- **OAuth2Callback**: Trang xử lý OAuth2 callback
- **BookingHistory**: Lịch sử đặt phòng của user
- **OwnerDashboard**: Dashboard cho owner (hotels, rooms, transactions, revenue)
- **AdminDashboard**: Dashboard cho admin (hotels, transactions, withdraws, revenue)
- **About**: Trang giới thiệu
- **Contact**: Trang liên hệ với Google Maps
- **NotFound**: 404 page

### Backend Services

#### Core Services
- **AuthService**: Xử lý đăng ký, đăng nhập, OTP, OAuth2
- **HotelService**: Quản lý khách sạn, tìm kiếm, filter
- **RoomsService**: Quản lý phòng, cập nhật giá, status, discount
- **BookingService**: Tạo booking, thanh toán, QR code generation
- **Booking_transactionsService**: Quản lý giao dịch, tính doanh thu
- **withdrawhistoryService**: Quản lý yêu cầu rút tiền
- **WalletService**: Quản lý ví, số dư
- **WalletTransactionService**: Quản lý giao dịch ví
- **HotelReviewService**: Quản lý đánh giá khách sạn
- **InfoService**: Quản lý thông tin công ty, FAQ, contact
- **GeocodingService**: Chuyển đổi địa chỉ thành tọa độ
- **OpenAiService**: Xử lý AI chat
- **QrCodeService**: Tạo QR code cho booking
- **CloudinaryService**: Upload ảnh lên Cloudinary

#### Utilities
- **HttpResponseUtil**: Standardized API response format
- **CustomOAuth2UserService**: Xử lý OAuth2 user từ Google
- **JwtTokenProvider**: Tạo và validate JWT token

---

## 🚨 Lưu ý quan trọng

1. **Environment Variables**: Cần cấu hình các API keys trong `application.properties`:
   - Google Maps API Key
   - OpenAI API Key
   - VNPay credentials
   - Gmail SMTP credentials
   - Cloudinary credentials

2. **Database Setup**: Chạy `setup.sql` trước khi chạy ứng dụng lần đầu

3. **File Uploads**: 
   - QR codes được lưu tại `uploads/qr/`
   - Cần cấu hình static resource handler trong Spring Boot

4. **CORS**: Đảm bảo CORS được cấu hình đúng trong `SecurityConfig`

5. **JWT Secret**: Cần có JWT secret key trong `application.properties`

---

## 📞 Liên hệ

Nếu có thắc mắc hoặc cần hỗ trợ, vui lòng liên hệ qua trang Contact của ứng dụng.

---

**Phiên bản:** 1.0.0  
**Cập nhật lần cuối:** 2024

