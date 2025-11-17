# Routes của ứng dụng Hotels Booking

## Danh sách các routes

1. **`/`** - Trang chủ
   - Hero section với booking form
   - Promotional banner
   - Feature cards
   - Chatbox button

2. **`/hotels`** - Danh sách khách sạn
   - Header với booking filters
   - Filter bar với các tùy chọn sắp xếp
   - Grid hiển thị các hotel cards

3. **`/hotel/:id`** - Chi tiết khách sạn
   - Thông tin khách sạn và rating
   - Image gallery
   - Tabs: Về, phòng, bình luận
   - Room types với giá và thông tin
   - Amenities và surroundings
   - Reviews section

4. **`/login`** - Đăng nhập
   - Form đăng nhập với email/password
   - Google login button
   - Link đến trang đăng ký

5. **`/register`** - Đăng ký
   - Form đăng ký với các trường: Họ tên, Email, Mật khẩu, Vai trò
   - Link đến trang đăng nhập

6. **`/booking-history`** - Lịch sử đặt phòng
   - Danh sách các booking đã đặt
   - Thông tin chi tiết mỗi booking
   - Nút hủy phòng

## Components chung

- **Header** - Header component với navigation và booking form
- **ChatBox** - AI chat interface (hiển thị ở tất cả các trang)
- **HotelCard** - Card hiển thị thông tin khách sạn

## Navigation

- Header có navigation links: Home, Hotels, Lịch sử đặt phòng
- Logo "Hotels booking" luôn link về trang chủ
- Nút "Log in" link đến trang đăng nhập

