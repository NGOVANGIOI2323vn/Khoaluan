# Hướng dẫn tích hợp FE và BE

## Tổng quan

Đã tích hợp hoàn toàn Frontend (React + TypeScript) với Backend (Spring Boot) thay thế tất cả dữ liệu fake bằng API thật.

## Những gì đã được thực hiện

### Backend (BE)

1. **Thêm các endpoint còn thiếu:**
   - `GET /api/hotel/{id}` - Lấy thông tin khách sạn theo ID
   - `GET /api/rooms/hotel/{hotelId}` - Lấy danh sách phòng theo khách sạn
   - `GET /api/booking/user` - Lấy lịch sử đặt phòng của user hiện tại
   - `GET /api/hotel/{id}/reviews` - Lấy đánh giá của khách sạn

2. **Cập nhật Repository:**
   - Thêm method `findByHotelId` trong `RoomsRepository`
   - Thêm method `findByUserOrderByBookingDateDesc` trong `BookingRepository`

### Frontend (FE)

1. **Cài đặt và cấu hình:**
   - Cài đặt `axios` cho HTTP requests
   - Tạo API service layer với interceptors cho authentication

2. **Tạo các service:**
   - `api.ts` - Axios instance với base config
   - `authService.ts` - Xử lý đăng nhập, đăng ký, OTP
   - `hotelService.ts` - Xử lý hotels, rooms, reviews
   - `bookingService.ts` - Xử lý booking và thanh toán

3. **Tích hợp các trang:**
   - ✅ Login - Tích hợp với API đăng nhập
   - ✅ Register - Tích hợp với API đăng ký
   - ✅ Home - Hiển thị danh sách khách sạn từ API
   - ✅ HotelList - Lấy danh sách khách sạn từ API
   - ✅ HotelDetail - Lấy thông tin hotel, rooms, reviews từ API
   - ✅ BookingHistory - Lấy lịch sử đặt phòng từ API
   - ⚠️ Booking - Cần tích hợp (hiện tại vẫn dùng fake data)
   - ⚠️ Checkout - Cần tích hợp (hiện tại vẫn dùng fake data)

## Cách sử dụng Seed Data

### 1. Chạy script SQL

File seed data nằm tại: `BE/src/main/resources/data.sql`

Bạn có thể chạy script này bằng cách:

**Option 1: Sử dụng MySQL Workbench hoặc phpMyAdmin**
- Mở file `data.sql`
- Copy toàn bộ nội dung
- Chạy trong MySQL client

**Option 2: Sử dụng command line**
```bash
cd BE
mysql -u root -p KLTN < src/main/resources/data.sql
```

**Option 3: Sử dụng Spring Boot Data Initialization**
- Đổi tên file từ `data.sql` thành `import.sql`
- Spring Boot sẽ tự động chạy khi khởi động (nếu `spring.jpa.hibernate.ddl-auto=create`)

### 2. Dữ liệu mẫu được tạo

**Users:**
- `admin` / `123456` - Admin
- `owner1` / `123456` - Chủ khách sạn 1
- `owner2` / `123456` - Chủ khách sạn 2
- `user1` / `123456` - Khách hàng 1
- `user2` / `123456` - Khách hàng 2

**Hotels:**
- 5 khách sạn mẫu với đầy đủ thông tin
- Tất cả đều có status = 'success' (đã được phê duyệt)

**Rooms:**
- 18 phòng mẫu phân bổ cho 5 khách sạn
- Nhiều loại phòng: STANDARD, DELUXE, SUITE, EXECUTIVE, FAMILY
- Có phòng có discount, có phòng không

**Reviews:**
- 8 đánh giá mẫu từ các user khác nhau

**Bookings:**
- 3 booking mẫu (1 đã thanh toán, 1 chờ thanh toán, 1 đã hoàn thành)

## Cấu hình

### Backend
- Port: `8081`
- Database: `KLTN`
- Base URL: `http://localhost:8081/api`

### Frontend
- Port: `5173` (Vite default)
- API Base URL: `http://localhost:8081/api`

## Lưu ý

1. **Authentication:**
   - Token được lưu trong `localStorage` với key `token`
   - Token tự động được thêm vào header `Authorization` cho mọi request
   - Nếu token hết hạn (401), user sẽ được redirect về trang login

2. **CORS:**
   - Đảm bảo Backend đã cấu hình CORS để cho phép requests từ Frontend

3. **Image URLs:**
   - Hiện tại sử dụng Unsplash URLs cho images
   - Trong production, cần upload images lên server và lưu URL vào database

4. **Password:**
   - Tất cả password mẫu là `123456`
   - Password được hash bằng BCrypt với cost factor 10

## Các tính năng còn thiếu

1. **Booking Page:**
   - Cần tích hợp với API `POST /api/booking/create/{roomId}`
   - Cần lấy thông tin phòng từ API thay vì fake data

2. **Checkout Page:**
   - Cần tích hợp với API thanh toán
   - Có thể sử dụng VNPay hoặc wallet payment

3. **Error Handling:**
   - Cần cải thiện error handling và hiển thị thông báo lỗi tốt hơn

4. **Loading States:**
   - Một số trang đã có loading state, nhưng cần cải thiện UX

## Testing

1. **Test đăng nhập:**
   - Dùng `user1` / `123456` để đăng nhập
   - Kiểm tra token được lưu trong localStorage

2. **Test xem danh sách khách sạn:**
   - Vào `/hotels` - sẽ thấy 5 khách sạn từ database

3. **Test xem chi tiết khách sạn:**
   - Click vào một khách sạn - sẽ thấy thông tin, phòng, và đánh giá từ API

4. **Test lịch sử đặt phòng:**
   - Đăng nhập với `user1`
   - Vào `/booking-history` - sẽ thấy booking mẫu

## Troubleshooting

1. **Lỗi CORS:**
   - Kiểm tra `SecurityConfig` trong Backend có cho phép CORS từ Frontend

2. **Lỗi 401 Unauthorized:**
   - Kiểm tra token trong localStorage
   - Đảm bảo token còn hiệu lực
   - Thử đăng nhập lại

3. **Lỗi kết nối API:**
   - Kiểm tra Backend đã chạy chưa (port 8081)
   - Kiểm tra URL trong `api.ts` có đúng không

4. **Không có dữ liệu:**
   - Chạy lại script seed data
   - Kiểm tra database connection trong `application.properties`

