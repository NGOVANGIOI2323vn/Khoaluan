# 🏨 HỆ THỐNG ĐẶT PHÒNG KHÁCH SẠN (HOTEL BOOKING SYSTEM)

## 📋 Mục lục
1. [Tổng quan dự án](#tổng-quan-dự-án)
2. [Công nghệ sử dụng](#công-nghệ-sử-dụng)
3. [Cấu trúc dự án](#cấu-trúc-dự-án)
4. [Cài đặt và chạy dự án](#cài-đặt-và-chạy-dự-án)
5. [Các chức năng chính](#các-chức-năng-chính)
6. [Luồng đi của code](#luồng-đi-của-code)
7. [Mô tả nghiệp vụ](#mô-tả-nghiệp-vụ)
8. [Database Schema](#database-schema)

---

## 🎯 Tổng quan dự án

Hệ thống đặt phòng khách sạn là một ứng dụng web full-stack cho phép:
- **Người dùng (USER)**: Tìm kiếm, xem chi tiết, đặt phòng khách sạn, thanh toán qua VNPay
- **Chủ khách sạn (OWNER)**: Quản lý khách sạn, phòng, xem doanh thu, rút tiền
- **Quản trị viên (ADMIN)**: Duyệt khách sạn, quản lý giao dịch, quản lý yêu cầu rút tiền, xem tổng doanh thu

---

## 🛠️ Công nghệ sử dụng

### Frontend (FE)
- **Framework**: React 19.2.0 với TypeScript
- **Routing**: React Router DOM 7.9.6
- **UI Library**: 
  - Tailwind CSS 3.4.0 (styling)
  - Ant Design 6.0.0 (components)
  - @ant-design/charts 2.6.6 (biểu đồ)
  - Framer Motion 12.23.24 (animations)
  - Lucide React 0.554.0 (icons)
- **Form Management**: 
  - React Hook Form 7.66.1
  - Zod 4.1.12 (validation)
- **HTTP Client**: Axios 1.13.2
- **Maps**: @react-google-maps/api 2.20.7
- **Build Tool**: Vite 7.2.2

### Backend (BE)
- **Framework**: Spring Boot 3.3.4
- **Language**: Java 17
- **Security**: 
  - Spring Security
  - JWT (JSON Web Token)
  - OAuth2 (Google Login)
- **Database**: 
  - MySQL 8.0
  - Spring Data JPA / Hibernate
- **Payment**: VNPay Integration
- **Email**: Spring Mail (Gmail SMTP)
- **Maps**: Google Maps Services API
- **AI Chat**: OpenAI API
- **Build Tool**: Maven
- **Other**: Lombok, Jackson (JSON serialization)

### Database
- **RDBMS**: MySQL 8.0
- **Encoding**: UTF-8 (utf8mb4)

---

## 📁 Cấu trúc dự án

```
Khoaluan/
├── FE/                          # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   │   ├── AppModal.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── HotelCard.tsx
│   │   │   ├── HotelForm.tsx
│   │   │   ├── RoomForm.tsx
│   │   │   ├── WithdrawForm.tsx
│   │   │   ├── UploadImage.tsx
│   │   │   └── ...
│   │   ├── pages/               # Page components
│   │   │   ├── Home.tsx
│   │   │   ├── HotelList.tsx
│   │   │   ├── HotelDetail.tsx
│   │   │   ├── Booking.tsx
│   │   │   ├── Checkout.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── OwnerDashboard.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   └── ...
│   │   ├── services/            # API services
│   │   │   ├── api.ts           # Axios instance
│   │   │   ├── authService.ts
│   │   │   ├── hotelService.ts
│   │   │   ├── bookingService.ts
│   │   │   ├── ownerService.ts
│   │   │   └── adminService.ts
│   │   ├── contexts/            # React contexts
│   │   ├── hooks/               # Custom hooks
│   │   └── utils/               # Utilities
│   ├── package.json
│   └── vite.config.ts
│
└── BE/                          # Backend (Spring Boot)
    ├── src/main/java/com/example/KLTN/
    │   ├── Controller/          # REST Controllers
    │   │   ├── Auth/
    │   │   ├── hotel/
    │   │   ├── Booking/
    │   │   ├── Admin/
    │   │   ├── Vnpay/
    │   │   └── Wallet/
    │   ├── Service/             # Business logic
    │   ├── Repository/          # Data access layer
    │   ├── Entity/              # JPA entities
    │   ├── dto/                 # Data Transfer Objects
    │   ├── Config/              # Configuration
    │   └── KltnApplication.java
    ├── src/main/resources/
    │   ├── application.properties
    │   └── setup.sql            # Database setup script
    └── pom.xml
```

---

## 🚀 Cài đặt và chạy dự án

### ⚙️ Cấu hình môi trường (Bắt buộc - Làm đầu tiên)

**⚠️ QUAN TRỌNG:** Bạn PHẢI cấu hình environment variables trước khi chạy Backend và Frontend. Tất cả các giá trị nhạy cảm (passwords, API keys) đều được lưu trong environment variables để bảo mật.

#### Yêu cầu hệ thống
- Node.js >= 18.x
- Java 17
- Maven 3.8+
- MySQL 8.0
- Git
- Python 3 (cho script geocode)

#### Backend Environment Variables (BE/.env)

1. **Tạo file `.env` trong thư mục `BE/`:**
   ```bash
   cd BE
   cat > .env << EOF
   # Database
   export DB_URL=jdbc:mysql://localhost:3306/KLTN?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
   export DB_USERNAME=root
   export DB_PASSWORD=123456
   
   # Server
   export SERVER_PORT=8081
   export SERVER_PUBLIC_URL=http://localhost:8081
   
   # Frontend
   export FRONTEND_URL=http://localhost:3000
   
   # Email (Gmail SMTP) - Bắt buộc cho OTP
   export MAIL_USERNAME=your-email@gmail.com
   export MAIL_PASSWORD=your-app-password
   
   # VNPay - Bắt buộc cho payment
   export VNPAY_TMN_CODE=your-tmn-code
   export VNPAY_HASH_SECRET=your-hash-secret
   
   # Google OAuth2 - Bắt buộc cho Google login
   export GOOGLE_CLIENT_ID=your-google-client-id
   export GOOGLE_CLIENT_SECRET=your-google-client-secret
   
   # APIs - Bắt buộc
   export OPENAI_API_KEY=your-openai-api-key
   export GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   EOF
   ```

2. **Load environment variables:**
   ```bash
   source .env
   ```

   **Lưu ý:** Mỗi lần mở terminal mới, bạn cần chạy `source .env` lại.

#### Frontend Environment Variables

1. **Tạo file `.env` trong thư mục `FE/`:**
   ```bash
   cd FE
   cat > .env << EOF
   # API URL
   VITE_API_URL=http://localhost:8081
   
   # Google Maps API Key - Bắt buộc cho Maps
   VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   
   # Cloudinary - Bắt buộc cho upload ảnh
   VITE_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
   VITE_CLOUDINARY_API_KEY=your-cloudinary-api-key
   VITE_CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   EOF
   ```

#### Danh sách Environment Variables

**Backend (BE/.env):**

| Biến môi trường | Mô tả | Giá trị mặc định | Bắt buộc |
|----------------|-------|------------------|----------|
| `DB_URL` | Database connection URL | `jdbc:mysql://localhost:3306/KLTN?...` | Không |
| `DB_USERNAME` | Database username | `root` | Không |
| `DB_PASSWORD` | Database password | `123456` | Không |
| `SERVER_PORT` | Port của backend server | `8081` | Không |
| `SERVER_PUBLIC_URL` | Public URL của backend | `http://localhost:8081` | Không |
| `FRONTEND_URL` | URL của frontend | `http://localhost:3000` | Không |
| `MAIL_USERNAME` | Email để gửi OTP | - | Có (cho OTP) |
| `MAIL_PASSWORD` | App password của Gmail | - | Có (cho OTP) |
| `VNPAY_TMN_CODE` | VNPay Terminal Code | - | Có (cho payment) |
| `VNPAY_HASH_SECRET` | VNPay Hash Secret | - | Có (cho payment) |
| `GOOGLE_CLIENT_ID` | Google OAuth2 Client ID | - | Có (cho Google login) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 Client Secret | - | Có (cho Google login) |
| `OPENAI_API_KEY` | OpenAI API Key | - | Có (cho AI Chat) |
| `GOOGLE_MAPS_API_KEY` | Google Maps API Key | - | Có (cho Maps) |

**Frontend (FE/.env):**

| Biến môi trường | Mô tả | Bắt buộc |
|----------------|-------|----------|
| `VITE_API_URL` | URL của backend API | Không (mặc định: `http://localhost:8081`) |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API Key | Có (cho Maps) |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud Name | Có (cho upload ảnh) |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Cloudinary Upload Preset | Có (cho upload ảnh) |
| `VITE_CLOUDINARY_API_KEY` | Cloudinary API Key | Có (cho upload ảnh) |
| `VITE_CLOUDINARY_API_SECRET` | Cloudinary API Secret | Không (cho unsigned upload) |

#### Hướng dẫn lấy API Keys

1. **Gmail App Password:**
   - Vào Google Account → Security → 2-Step Verification
   - Tạo App Password cho "Mail"

2. **VNPay Credentials:**
   - Đăng ký tại [VNPay Sandbox](https://sandbox.vnpayment.vn/)
   - Lấy TMN Code và Hash Secret

3. **Google OAuth2:**
   - Vào [Google Cloud Console](https://console.cloud.google.com/)
   - Tạo OAuth 2.0 Client ID
   - Thêm authorized redirect URI: `http://localhost:8081/login/oauth2/code/google`

4. **OpenAI API Key:**
   - Đăng ký tại [OpenAI](https://platform.openai.com/)
   - Tạo API key trong API Keys section

5. **Google Maps API Key:**
   - Vào [Google Cloud Console](https://console.cloud.google.com/)
   - Enable Maps JavaScript API và Geocoding API
   - Tạo API Key

6. **Cloudinary:**
   - Đăng ký tại [Cloudinary](https://cloudinary.com/)
   - Lấy Cloud Name, API Key từ Dashboard
   - Tạo Upload Preset (unsigned) trong Settings → Upload

---

### Hướng dẫn cài đặt từng bước

#### Bước 1: Cài đặt Database

1. **Tạo database MySQL:**
   ```bash
   mysql -u root -p
   ```
   Trong MySQL console:
   ```sql
   CREATE DATABASE KLTN CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   EXIT;
   ```

2. **Chạy script setup để tạo tables và dữ liệu mẫu:**
   ```bash
   mysql -u root -p KLTN < BE/src/main/resources/setup.sql
   ```
   
   Script này sẽ:
   - Tạo tất cả các bảng cần thiết
   - Thêm dữ liệu mẫu (users, hotels, rooms, bookings, etc.)
   - Tạo admin user: `username=admin`, `password=123456`
   - Tạo owner users và user thường
   - Tạo ví (wallets) cho tất cả users
   - Xóa các bản ghi trùng lặp nếu có

3. **Kiểm tra dữ liệu đã được tạo:**
   ```bash
   mysql -u root -p KLTN -e "SELECT COUNT(*) as hotel_count FROM hotel; SELECT COUNT(*) as user_count FROM Users; SELECT COUNT(*) as room_count FROM rooms;"
   ```

#### Bước 2: Cấu hình Backend

**Lưu ý:** Bạn đã cấu hình environment variables ở phần trên rồi. Nếu chưa, quay lại phần [Cấu hình môi trường](#-cấu-hình-môi-trường-bắt-buộc---làm-đầu-tiên).

1. **Load environment variables:**
   ```bash
   cd BE
   source .env
   ```

2. **Cài đặt dependencies (nếu chưa có):**
   ```bash
   cd BE
   ./mvnw clean install
   ```

#### Bước 3: Chạy Backend

1. **Chạy Backend:**
   ```bash
   cd BE
   ./mvnw spring-boot:run
   ```
   
   Hoặc nếu đã load environment variables:
   ```bash
   cd BE
   source .env && ./mvnw spring-boot:run
   ```

2. **Kiểm tra Backend đã chạy:**
   - Mở browser: `http://localhost:8081`
   - Hoặc test API: `curl http://localhost:8081/api/hotels?page=0&size=5`

Backend sẽ chạy tại: `http://localhost:8081`

#### Bước 4: Chạy Geocode Script (Tùy chọn nhưng khuyến nghị)

**Lưu ý:** Script này cần Backend đã chạy và có Google Maps API Key.

1. **Chạy script geocode để thêm tọa độ (latitude/longitude) cho các khách sạn:**
   ```bash
   cd BE
   chmod +x run-geocode-now.sh
   ./run-geocode-now.sh
   ```

   Script này sẽ:
   - Đăng nhập với admin account (username: `admin`, password: `123456`)
   - Tìm tất cả khách sạn chưa có latitude/longitude
   - Geocode địa chỉ của từng khách sạn bằng Google Maps API
   - Cập nhật database với tọa độ chính xác
   - Bỏ qua các khách sạn đã có tọa độ

2. **Kiểm tra kết quả:**
   ```bash
   mysql -u root -p KLTN -e "SELECT id, name, address, latitude, longitude FROM hotel WHERE latitude IS NOT NULL AND longitude IS NOT NULL LIMIT 5;"
   ```

#### Bước 5: Cấu hình Frontend

1. **Tạo file `.env` trong thư mục `FE/`:**
   ```bash
   cd FE
   cat > .env << EOF
   # API URL
   VITE_API_URL=http://localhost:8081
   
   # Google Maps API Key - Bắt buộc cho Maps
   VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   
   # Cloudinary - Bắt buộc cho upload ảnh
   VITE_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
   VITE_CLOUDINARY_API_KEY=your-cloudinary-api-key
   VITE_CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   EOF
   ```

2. **Cài đặt dependencies:**
   ```bash
   cd FE
   npm install
   ```

#### Bước 6: Chạy Frontend

1. **Chạy Frontend:**
   ```bash
   cd FE
   npm run dev
   ```

2. **Mở browser:**
   - Frontend: `http://localhost:3000`
   - Đăng nhập với:
     - Admin: `username=admin`, `password=123456`
     - Owner: `username=owner1`, `password=123456`
     - User: `username=user1`, `password=123456`

### Tóm tắt các lệnh cần chạy

```bash
# 1. Tạo database
mysql -u root -p -e "CREATE DATABASE KLTN CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. Setup database với dữ liệu mẫu
mysql -u root -p KLTN < BE/src/main/resources/setup.sql

# 3. Cấu hình Backend (tạo .env)
cd BE
# Tạo file .env với các API keys (xem hướng dẫn ở trên)
source .env

# 4. Chạy Backend
./mvnw spring-boot:run
# (Mở terminal mới để tiếp tục)

# 5. Chạy Geocode (sau khi Backend đã chạy)
cd BE
chmod +x run-geocode-now.sh
./run-geocode-now.sh

# 6. Cấu hình Frontend (mở terminal mới)
cd FE
# Tạo file .env với các API keys (xem hướng dẫn ở trên)

# 7. Chạy Frontend
npm install
npm run dev
```

### Kiểm tra hệ thống đã hoạt động

1. **Backend:**
   - `http://localhost:8081/api/hotels?page=0&size=5` - Xem danh sách khách sạn
   - `http://localhost:8081/api/auth/login` - Test đăng nhập

2. **Frontend:**
   - `http://localhost:3000` - Trang chủ
   - `http://localhost:3000/login` - Trang đăng nhập
   - `http://localhost:3000/admin` - Admin Dashboard (cần đăng nhập admin)
   - `http://localhost:3000/owner` - Owner Dashboard (cần đăng nhập owner)

---

## 🎯 Các chức năng chính

### 1. **Xác thực người dùng (Authentication)**
- Đăng ký tài khoản (USER, OWNER)
- Đăng nhập (Email/Password)
- Đăng nhập bằng Google (OAuth2)
- OAuth2 callback xử lý token và redirect
- Xác thực OTP qua email (trang VerifyOtp)
- Gửi lại OTP nếu hết hạn
- JWT token authentication
- Protected routes theo role (USER, OWNER, ADMIN)

### 2. **Quản lý khách sạn (Hotel Management)**
- Tìm kiếm khách sạn (theo tên, địa chỉ)
- Xem danh sách khách sạn (có phân trang, sắp xếp)
- Xem chi tiết khách sạn
- Chủ khách sạn: Tạo, chỉnh sửa, xóa khách sạn
- Upload nhiều ảnh cho khách sạn
- Admin: Duyệt/từ chối khách sạn mới
- Admin: Xem tất cả khách sạn (pending, success, fail)
- Cập nhật discount cho toàn bộ phòng của khách sạn
- Geocoding: Chuyển đổi địa chỉ thành tọa độ (lat/lng) - tự động hoặc thủ công

### 3. **Quản lý phòng (Room Management)**
- Xem danh sách phòng của khách sạn
- Chủ khách sạn: Tạo, chỉnh sửa phòng
- Quản lý giá phòng, loại phòng, sức chứa
- Quản lý giảm giá (discount)
- Upload ảnh phòng
- Cập nhật riêng lẻ: giá, status, type, capacity, discount, image
- Xem lịch sử đặt phòng theo từng phòng

### 4. **Đặt phòng (Booking)**
- Chọn ngày check-in/check-out
- Chọn số lượng khách
- Chọn phòng
- Xem tổng tiền
- Validate: kiểm tra phòng available, kiểm tra ngày đã được đặt chưa
- Tạo booking (trạng thái PENDING)
- Tự động tạo QR code cho booking (chứa thông tin booking)
- Thanh toán qua VNPay
- Xem lịch sử đặt phòng
- Xem lịch sử đặt phòng theo từng phòng
- Hủy đặt phòng (status = REFUNDED)

### 5. **Thanh toán (Payment)**
- Tích hợp VNPay
- Tạo giao dịch thanh toán
- Xử lý callback từ VNPay
- Cập nhật trạng thái booking (PAID/FAILED)
- Tạo booking transaction (phân chia doanh thu)

### 6. **Quản lý ví (Wallet Management)**
- Mỗi user có một ví (wallet)
- Xem số dư ví (hiển thị trong header)
- Owner: Yêu cầu rút tiền
- Owner: Xem lịch sử yêu cầu rút tiền của mình
- Admin: Duyệt/từ chối yêu cầu rút tiền
- Admin: Xem tất cả yêu cầu rút tiền
- Tự động trừ tiền khi tạo yêu cầu rút
- Hoàn tiền nếu yêu cầu bị từ chối

### 7. **Quản lý doanh thu (Revenue Management)**
- Owner: Xem doanh thu theo từng khách sạn
- Owner: Xem biểu đồ doanh thu (Column chart)
- Owner: Xem giao dịch của mình (my-transactions)
- Admin: Xem tổng doanh thu hệ thống
- Admin: Xem doanh thu admin vs owner (Pie chart)
- Admin: Xem tất cả giao dịch
- Phân loại: Approved, Pending

### 8. **Đánh giá khách sạn (Reviews)**
- User: Xem đánh giá
- User: Viết đánh giá (sau khi đã đặt phòng)
- Hiển thị rating trung bình

### 9. **Quản trị viên (Admin Dashboard)**
- Duyệt/từ chối khách sạn mới
- Quản lý tất cả khách sạn (pending, success, fail)
- Tìm kiếm khách sạn trong danh sách quản lý
- Quản lý giao dịch
- Quản lý yêu cầu rút tiền
- Xem tổng doanh thu hệ thống
- Cấu hình tỷ lệ phần trăm admin (admin percent)
- Geocoding: Geocode tất cả khách sạn hoặc một khách sạn cụ thể

### 10. **Trang thông tin (Info Pages)**
- Trang chủ (Home)
- Giới thiệu (About) - lấy từ company_info
- Liên hệ (Contact) - có Google Maps, contact_info, offices
- FAQ (Câu hỏi thường gặp)
- Gửi tin nhắn liên hệ (contact message)

### 11. **AI Chat**
- Chatbot tích hợp OpenAI
- Trả lời câu hỏi về khách sạn, đặt phòng
- Tự động tìm và gợi ý khách sạn phù hợp
- Hiển thị lịch sử đặt phòng của user (nếu đã đăng nhập)

### 12. **Geocoding (Chuyển đổi địa chỉ thành tọa độ)**
- Chuyển đổi địa chỉ thành latitude/longitude
- Place autocomplete (gợi ý địa chỉ khi nhập)
- Lấy chi tiết địa điểm từ place ID
- Admin: Geocode tất cả khách sạn chưa có tọa độ
- Admin: Geocode một khách sạn cụ thể

---

## 🔄 Luồng đi của code

### 1. **Đăng ký tài khoản (Register)**

#### Frontend (`FE/src/pages/Register.tsx`)
```typescript
1. User điền form (username, email, password, phone, role)
2. Validate form với react-hook-form + zod
3. Gọi API: authService.registerUser(data)
```

#### Backend (`BE/src/main/java/com/example/KLTN/Controller/Auth/authController.java`)
```java
1. Nhận request tại: POST /api/auth/register
2. Controller gọi: authService.registerUser(dto, "USER")
```

#### Service (`BE/src/main/java/com/example/KLTN/Service/AuthService.java`)
```java
1. Validate dữ liệu
2. Kiểm tra email/username đã tồn tại chưa
3. Hash password với BCrypt
4. Tạo user mới trong database
5. Tạo wallet mặc định (balance = 0)
6. Gửi OTP qua email
7. Trả về response
```

#### Database
```sql
1. INSERT INTO Users (username, email, password, phone, role_id, verified)
2. INSERT INTO wallets (user_id, balance) VALUES (new_user_id, 0)
3. UPDATE Users SET otp = ?, timeExpired = ? WHERE id = ?
```

**Nghiệp vụ:**
- User đăng ký với email, password
- Hệ thống tạo tài khoản nhưng chưa verified
- Gửi OTP qua email để xác thực
- Tự động tạo ví với số dư 0

---

### 2. **Đăng nhập (Login)**

#### Frontend (`FE/src/pages/Login.tsx`)
```typescript
1. User điền email và password
2. Gọi API: authService.login({ email, password })
3. Lưu JWT token vào localStorage
4. Redirect đến trang chủ hoặc dashboard
```

#### Backend (`BE/src/main/java/com/example/KLTN/Controller/Auth/authController.java`)
```java
1. Nhận request tại: POST /api/auth/login
2. Controller gọi: authService.login(dto)
```

#### Service (`BE/src/main/java/com/example/KLTN/Service/AuthService.java`)
```java
1. Tìm user theo email
2. Kiểm tra password với BCrypt
3. Kiểm tra user đã verified chưa
4. Tạo JWT token (chứa username, role)
5. Trả về token và thông tin user
```

#### Database
```sql
SELECT * FROM Users WHERE email = ? AND verified = true
```

**Nghiệp vụ:**
- User đăng nhập với email/password
- Hệ thống xác thực và trả về JWT token
- Token được dùng cho các request tiếp theo
- Chỉ user đã verified mới đăng nhập được

---

### 3. **Tạo khách sạn mới (Create Hotel)**

#### Frontend (`FE/src/pages/OwnerDashboard.tsx`)
```typescript
1. Owner click "Thêm khách sạn"
2. Mở modal với HotelForm component
3. Điền thông tin: name, address, phone, description
4. Upload nhiều ảnh (tối đa 10 ảnh)
5. Gọi API: hotelService.createHotel(formData, images)
```

#### Backend (`BE/src/main/java/com/example/KLTN/Controller/hotel/HotelRequestController.java`)
```java
1. Nhận request tại: POST /api/hotel/create
2. @PreAuthorize("hasRole('OWNER')") - chỉ OWNER mới được
3. Controller gọi: hotelService.createHotel(dto, images, owner)
```

#### Service (`BE/src/main/java/com/example/KLTN/Service/HotelService.java`)
```java
1. Lấy thông tin owner từ SecurityContext
2. Upload ảnh lên Cloudinary
3. Tạo HotelEntity mới với status = "pending"
4. Lưu hotel vào database
5. Lưu các ảnh vào hotel_images table
6. Trả về hotel đã tạo
```

#### Database
```sql
1. INSERT INTO hotel (name, address, phone, description, status, owner_user, deleted)
   VALUES (?, ?, ?, ?, 'pending', ?, false)

2. INSERT INTO hotel_images (image_url, display_order, hotel_id, deleted)
   VALUES (?, ?, ?, false)
```

**Nghiệp vụ:**
- Owner tạo khách sạn mới
- Khách sạn có trạng thái "pending" (chờ duyệt)
- Admin phải duyệt thì khách sạn mới hiển thị công khai
- Mỗi khách sạn có thể có nhiều ảnh

---

### 4. **Duyệt khách sạn (Approve Hotel)**

#### Frontend (`FE/src/pages/AdminDashboard.tsx`)
```typescript
1. Admin xem danh sách khách sạn chờ duyệt
2. Click "Duyệt" hoặc "Từ chối"
3. Gọi API: adminService.approveHotel(hotelId) hoặc rejectHotel(hotelId)
```

#### Backend (`BE/src/main/java/com/example/KLTN/Controller/Admin/HotelController.java`)
```java
1. Nhận request tại: PUT /api/admin/hotels/{id}/approve
2. @PreAuthorize("hasRole('ADMIN')") - chỉ ADMIN mới được
3. Controller gọi: hotelService.approveHotel(id)
```

#### Service (`BE/src/main/java/com/example/KLTN/Service/HotelService.java`)
```java
1. Tìm hotel theo id
2. Kiểm tra hotel có status = "pending"
3. Cập nhật status = "success"
4. Lưu vào database
```

#### Database
```sql
UPDATE hotel SET status = 'success' WHERE id = ? AND status = 'pending'
```

**Nghiệp vụ:**
- Admin xem danh sách khách sạn chờ duyệt
- Admin có thể duyệt (status = "success") hoặc từ chối (status = "fail")
- Chỉ khách sạn đã được duyệt mới hiển thị cho user

---

### 5. **Đặt phòng (Create Booking)**

#### Frontend (`FE/src/pages/Booking.tsx`)
```typescript
1. User chọn hotel, check-in, check-out, số khách
2. Chọn phòng từ danh sách
3. Xem tổng tiền
4. Click "Đặt phòng"
5. Gọi API: bookingService.createBooking(bookingData)
```

#### Backend (`BE/src/main/java/com/example/KLTN/Controller/Booking/BookingController.java`)
```java
1. Nhận request tại: POST /api/booking/create
2. @PreAuthorize("hasRole('USER')") - chỉ USER mới được
3. Controller gọi: bookingService.createBooking(dto, user)
```

#### Service (`BE/src/main/java/com/example/KLTN/Service/BookingService.java`)
```java
1. Validate check-in < check-out
2. Kiểm tra phòng có available không
3. Tính tổng tiền (price * số đêm)
4. Tạo BookingEntity với status = "PENDING"
5. Tạo QR code cho booking
6. Lưu booking vào database
7. Trả về booking với payment URL (VNPay)
```

#### Database
```sql
INSERT INTO booking (status, booking_date, check_in_date, check_out_date, 
                     total_price, qr_url, user_id, hotel_id, rooms_id)
VALUES ('PENDING', NOW(), ?, ?, ?, '/uploads/qr/qr_booking_{id}.png', ?, ?, ?)
```

**Nghiệp vụ:**
- User đặt phòng với thông tin check-in/check-out
- Hệ thống validate: ngày không được quá khứ, phòng phải available
- Kiểm tra xung đột: phòng đã được đặt trong khoảng thời gian này chưa
- Booking được tạo với trạng thái PENDING (chờ thanh toán)
- Tự động tạo QR code chứa thông tin booking (tên user, hotel, phòng, ngày)
- QR code được lưu tại: /uploads/qr/qr_booking_{id}.png
- User phải thanh toán để booking chuyển sang PAID
- QR code được dùng để check-in tại khách sạn

---

### 6. **Thanh toán qua VNPay (Payment)**

#### Frontend (`FE/src/pages/Checkout.tsx`)
```typescript
1. User xem thông tin booking và tổng tiền
2. Chọn phương thức thanh toán (VNPay)
3. Click "Thanh toán"
4. Gọi API: bookingService.createPayment(bookingId)
5. Redirect đến VNPay payment page
```

#### Backend (`BE/src/main/java/com/example/KLTN/Controller/Vnpay/VnpayController.java`)
```java
1. Nhận request tại: POST /api/vnpay/create
2. Tạo payment URL với thông tin:
   - amount, orderInfo, orderId
   - returnUrl (callback URL)
3. Tạo hash signature với secret key
4. Redirect user đến VNPay
```

#### VNPay Callback (`BE/src/main/java/com/example/KLTN/Controller/Vnpay/VnpayController.java`)
```java
1. VNPay redirect về: GET /api/vnpay/return
2. Verify signature từ VNPay
3. Kiểm tra response code:
   - "00": Thanh toán thành công
   - Khác: Thanh toán thất bại
4. Cập nhật booking status = "PAID" hoặc "FAILED"
5. Tạo booking_transaction (phân chia doanh thu)
```

#### Service (`BE/src/main/java/com/example/KLTN/Service/BookingService.java`)
```java
1. Cập nhật booking status = "PAID"
2. Tính toán doanh thu:
   - adminPercent = lấy từ Percen table
   - adminRevenue = totalPrice * adminPercent
   - ownerRevenue = totalPrice * (1 - adminPercent)
3. Tạo Booking_transactionsEntity:
   - status = "pending" (chờ owner check-in)
   - admin_revenue, owner_revenue
4. Lưu vào database
```

#### Database
```sql
1. UPDATE booking SET status = 'PAID' WHERE id = ?

2. INSERT INTO booking_transactions (booking_id, hotel_id, owner_id, 
                                     total_amount, admin_revenue, owner_revenue, 
                                     status, created_at)
VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())
```

**Nghiệp vụ:**
- User thanh toán qua VNPay
- Sau khi thanh toán thành công, booking chuyển sang PAID
- Hệ thống tự động phân chia doanh thu:
  - Admin nhận: totalPrice * adminPercent
  - Owner nhận: totalPrice * (1 - adminPercent)
- Transaction có status "pending" cho đến khi owner xác nhận check-in

---

### 7. **Xem doanh thu (View Revenue)**

#### Frontend - Owner (`FE/src/pages/OwnerDashboard.tsx`)
```typescript
1. Owner click tab "Doanh thu"
2. Gọi API: ownerService.getRevenue()
3. Hiển thị:
   - Tổng doanh thu
   - Doanh thu đã duyệt
   - Doanh thu chờ duyệt
   - Biểu đồ cột (Column chart) theo từng khách sạn
```

#### Backend (`BE/src/main/java/com/example/KLTN/Controller/Admin/TransactionController.java`)
```java
1. Nhận request tại: GET /api/admin/transactions/revenue/owner
2. @PreAuthorize("hasRole('OWNER')")
3. Controller gọi: booking_transactionsService.getOwnerRevenue()
```

#### Service (`BE/src/main/java/com/example/KLTN/Service/Booking_transactionsService.java`)
```java
1. Lấy owner từ SecurityContext
2. Query database:
   - approvedRevenue: SUM(owner_revenue) WHERE status = 'approved'
   - pendingRevenue: SUM(owner_revenue) WHERE status = 'pending'
   - totalRevenue: SUM(owner_revenue)
3. Group by hotel_id để lấy doanh thu theo từng khách sạn
4. Trả về RevenueSummaryDTO
```

#### Database
```sql
SELECT 
    hotel_id,
    SUM(CASE WHEN status = 'approved' THEN owner_revenue ELSE 0 END) as approved_revenue,
    SUM(CASE WHEN status = 'pending' THEN owner_revenue ELSE 0 END) as pending_revenue,
    SUM(owner_revenue) as total_revenue
FROM booking_transactions
WHERE owner_id = ?
GROUP BY hotel_id
```

**Nghiệp vụ:**
- Owner xem doanh thu của tất cả khách sạn của mình
- Phân loại: Đã duyệt (approved) và Chờ duyệt (pending)
- Pending: Giao dịch chưa được owner xác nhận check-in
- Approved: Giao dịch đã được xác nhận, tiền có thể rút

---

### 8. **Yêu cầu rút tiền (Withdraw Request)**

#### Frontend (`FE/src/pages/OwnerDashboard.tsx`)
```typescript
1. Owner click tab "Rút tiền"
2. Click "Rút tiền"
3. Mở modal với WithdrawForm
4. Điền: amount, bankName, accountNumber, accountHolderName
5. Validate: amount <= walletBalance
6. Gọi API: ownerService.createWithdraw(withdrawData)
```

#### Backend (`BE/src/main/java/com/example/KLTN/Controller/Vnpay/withdrawmoneyController.java`)
```java
1. Nhận request tại: POST /api/withdraw/create
2. @PreAuthorize("hasRole('OWNER')")
3. Controller gọi: withdrawhistoryService.createWithdraw(dto, user)
```

#### Service (`BE/src/main/java/com/example/KLTN/Service/withdrawhistoryService.java`)
```java
1. Lấy wallet của user
2. Kiểm tra: amount <= wallet.balance
3. Trừ tiền ngay: wallet.balance -= amount
4. Tạo WithDrawHistoryEntity với status = "pending"
5. Tạo WalletTransactionEntity (type = "PAYMENT", status = "pending")
6. Lưu vào database
```

#### Database
```sql
1. UPDATE wallets SET balance = balance - ? WHERE user_id = ?

2. INSERT INTO withdraw_history (amount, bank_name, account_number, 
                                 account_holder_name, status, user_id, created_at)
VALUES (?, ?, ?, ?, 'pending', ?, NOW())

3. INSERT INTO wallet_transaction (wallet_id, amount, transaction_type, 
                                    status, created_at)
VALUES (?, ?, 'PAYMENT', 'pending', NOW())
```

**Nghiệp vụ:**
- Owner yêu cầu rút tiền từ ví
- Tiền được trừ ngay khi tạo yêu cầu (không phải chờ duyệt)
- Admin phải duyệt yêu cầu
- Nếu bị từ chối, tiền sẽ được hoàn lại

---

### 9. **Duyệt yêu cầu rút tiền (Approve/Reject Withdraw)**

#### Frontend (`FE/src/pages/AdminDashboard.tsx`)
```typescript
1. Admin xem danh sách yêu cầu rút tiền
2. Click "Duyệt" hoặc "Từ chối"
3. Gọi API: adminService.approveWithdraw(id) hoặc rejectWithdraw(id)
```

#### Backend (`BE/src/main/java/com/example/KLTN/Controller/Admin/TransactionController.java`)
```java
1. Nhận request tại: PUT /api/admin/withdraws/{id}/approve hoặc /reject
2. @PreAuthorize("hasRole('ADMIN')")
3. Controller gọi: withdrawhistoryService.approveWithdraw(id) hoặc rejectWithdraw(id)
```

#### Service - Approve (`BE/src/main/java/com/example/KLTN/Service/withdrawhistoryService.java`)
```java
1. Tìm withdraw request
2. Cập nhật status = "resolved"
3. Cập nhật WalletTransaction status = "success"
4. (Tiền đã được trừ từ trước, không cần làm gì thêm)
```

#### Service - Reject (`BE/src/main/java/com/example/KLTN/Service/withdrawhistoryService.java`)
```java
1. Tìm withdraw request
2. Hoàn tiền: wallet.balance += amount
3. Cập nhật status = "rejected"
4. Tạo WalletTransaction mới (type = "DEPOSIT", status = "success")
```

#### Database - Approve
```sql
1. UPDATE withdraw_history SET status = 'resolved' WHERE id = ?

2. UPDATE wallet_transaction SET status = 'success' 
   WHERE id = ? AND transaction_type = 'PAYMENT'
```

#### Database - Reject
```sql
1. UPDATE wallets SET balance = balance + ? WHERE user_id = ?

2. UPDATE withdraw_history SET status = 'rejected' WHERE id = ?

3. UPDATE wallet_transaction SET status = 'failed' 
   WHERE id = ? AND transaction_type = 'PAYMENT'

4. INSERT INTO wallet_transaction (wallet_id, amount, transaction_type, 
                                    status, created_at)
VALUES (?, ?, 'DEPOSIT', 'success', NOW())
```

**Nghiệp vụ:**
- Admin duyệt yêu cầu rút tiền
- Nếu duyệt: Chỉ cập nhật status (tiền đã trừ từ trước)
- Nếu từ chối: Hoàn tiền lại ví và tạo transaction DEPOSIT

---

### 10. **Tìm kiếm khách sạn (Search Hotels)**

#### Frontend (`FE/src/pages/HotelList.tsx`)
```typescript
1. User nhập từ khóa vào search input
2. Debounce 500ms để tránh gọi API quá nhiều
3. Gọi API: hotelService.getHotels({ search: query, page, size, sortBy })
```

#### Backend (`BE/src/main/java/com/example/KLTN/Controller/hotel/HotelRequestController.java`)
```java
1. Nhận request tại: GET /api/hotels?search=...&page=...&size=...
2. Controller gọi: hotelService.findHotelsWithFilters(filterRequest)
```

#### Service (`BE/src/main/java/com/example/KLTN/Service/HotelService.java`)
```java
1. Nếu có search query:
   - Tìm hotels có name LIKE %search% OR address LIKE %search%
2. Filter: chỉ hotels có status = "success" và deleted = false
3. Sort theo: rating, price, name
4. Phân trang
5. Tính minPrice cho mỗi hotel (giá phòng thấp nhất)
6. Trả về danh sách hotels
```

#### Database
```sql
SELECT h.*, MIN(r.price) as min_price
FROM hotel h
LEFT JOIN rooms r ON r.hotel_id = h.id AND r.deleted = false
WHERE h.status = 'success' 
  AND h.deleted = false
  AND (h.name LIKE %?% OR h.address LIKE %?%)
GROUP BY h.id
ORDER BY ? 
LIMIT ? OFFSET ?
```

**Nghiệp vụ:**
- User tìm kiếm khách sạn theo tên hoặc địa chỉ
- Chỉ hiển thị khách sạn đã được duyệt
- Kết quả có phân trang và sắp xếp

---

## 💼 Mô tả nghiệp vụ

### 1. **Quy trình đặt phòng và thanh toán**

```
1. User tìm kiếm khách sạn
   ↓
2. Xem chi tiết khách sạn và phòng
   ↓
3. Chọn ngày check-in/check-out, số khách
   ↓
4. Tạo booking (status = PENDING)
   ↓
5. Thanh toán qua VNPay
   ↓
6. VNPay callback → Cập nhật booking (status = PAID)
   ↓
7. Tạo booking_transaction (phân chia doanh thu)
   - status = "pending" (chờ owner xác nhận check-in)
   ↓
8. Owner xác nhận check-in → Cập nhật transaction (status = "approved")
   ↓
9. Owner có thể rút tiền từ doanh thu đã approved
```

### 2. **Quy trình quản lý khách sạn**

```
1. Owner tạo khách sạn mới
   - status = "pending"
   ↓
2. Admin xem danh sách khách sạn chờ duyệt
   ↓
3. Admin duyệt (status = "success") hoặc từ chối (status = "fail")
   ↓
4. Khách sạn đã duyệt hiển thị công khai cho user
   ↓
5. Owner có thể chỉnh sửa, thêm ảnh, quản lý phòng
```

### 3. **Quy trình rút tiền**

```
1. Owner có doanh thu đã approved trong ví
   ↓
2. Owner tạo yêu cầu rút tiền
   - Nhập: số tiền, thông tin ngân hàng
   - Tiền được trừ ngay khỏi ví
   ↓
3. Admin xem danh sách yêu cầu rút tiền
   ↓
4. Admin duyệt:
   - Cập nhật status = "resolved"
   - (Tiền đã trừ từ trước)
   ↓
   Hoặc từ chối:
   - Hoàn tiền lại ví
   - Cập nhật status = "rejected"
```

### 4. **Phân chia doanh thu**

```
Khi user thanh toán booking:
- Tổng tiền: 1,000,000 VND
- Admin percent: 10% (cấu hình trong Percen table)
- Admin nhận: 100,000 VND
- Owner nhận: 900,000 VND

Lưu vào booking_transactions:
- status = "pending" (chờ owner xác nhận check-in)
- Khi owner xác nhận → status = "approved"
- Tiền được cộng vào owner's wallet
```

### 5. **Quản lý phòng**

```
1. Owner tạo phòng mới
   - Số phòng, loại phòng, giá, sức chứa, ảnh
   ↓
2. Owner có thể chỉnh sửa:
   - Giá phòng
   - Loại phòng
   - Sức chứa
   - Giảm giá (%)
   - Ảnh phòng
   ↓
3. Owner có thể xóa phòng (soft delete)
```

---

## 📋 Danh sách API Endpoints đầy đủ

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Đăng ký USER
- `POST /api/auth/register/owner` - Đăng ký OWNER
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/otp/send` - Gửi OTP
- `POST /api/auth/otp/verify` - Xác thực OTP
- `GET /api/auth/success` - OAuth2 success callback

### Hotels (`/api/hotels`)
- `GET /api/hotels` - Lấy danh sách khách sạn (public, có filter, search, pagination)
- `GET /api/hotels/{id}` - Lấy chi tiết khách sạn
- `GET /api/hotels/{id}/rooms` - Lấy danh sách phòng của khách sạn
- `GET /api/hotels/{id}/reviews` - Lấy đánh giá khách sạn
- `POST /api/hotels` - Tạo khách sạn mới (OWNER)
- `PUT /api/hotels/{id}` - Cập nhật khách sạn (OWNER)
- `PUT /api/hotels/{id}/discount` - Cập nhật discount cho tất cả phòng (OWNER)
- `DELETE /api/hotels/{id}` - Xóa khách sạn (OWNER, soft delete)
- `GET /api/hotels/owner/my-hotels` - Lấy danh sách khách sạn của owner

### Rooms (`/api/rooms`)
- `PUT /api/rooms/{id}/image` - Cập nhật ảnh phòng
- `PUT /api/rooms/{id}/price` - Cập nhật giá phòng
- `PUT /api/rooms/{id}/status` - Cập nhật trạng thái phòng (AVAILABLE/UNAVAILABLE)
- `PUT /api/rooms/{id}/type` - Cập nhật loại phòng
- `PUT /api/rooms/{id}/discount` - Cập nhật discount phòng
- `PUT /api/rooms/{id}/capacity` - Cập nhật sức chứa phòng

### Reviews (`/api/hotels/{id}/reviews`)
- `POST /api/hotels/{id}/reviews` - Tạo đánh giá (USER)
- `GET /api/hotels/{id}/reviews` - Lấy danh sách đánh giá

### Bookings (`/api/bookings`)
- `POST /api/bookings/rooms/{roomId}` - Tạo booking (USER)
- `PUT /api/bookings/{id}/pay` - Thanh toán booking
- `GET /api/bookings` - Lấy lịch sử đặt phòng của user (USER)
- `GET /api/bookings/rooms/{roomId}` - Lấy lịch sử đặt phòng theo phòng

### Payment (`/api/vnpay`)
- `POST /api/vnpay/create` - Tạo payment URL
- `GET /api/vnpay/return` - Callback từ VNPay

### Wallet (`/api/wallet`)
- `GET /api/wallet/balance` - Lấy số dư ví (USER/OWNER/ADMIN)

### Withdraw (`/api/withdraws`)
- `POST /api/withdraws` - Tạo yêu cầu rút tiền (OWNER)
- `PUT /api/withdraws/{id}/approve` - Duyệt yêu cầu (ADMIN)
- `PUT /api/withdraws/{id}/reject` - Từ chối yêu cầu (ADMIN)
- `GET /api/withdraws` - Lấy tất cả yêu cầu (ADMIN)
- `GET /api/withdraws/my-withdraws` - Lấy yêu cầu của mình (OWNER)

### Admin - Hotels (`/api/admin/hotels`)
- `GET /api/admin/hotels/pending` - Lấy khách sạn chờ duyệt (có search)
- `GET /api/admin/hotels` - Lấy tất cả khách sạn (có search)
- `PUT /api/admin/hotels/{id}/approve` - Duyệt khách sạn
- `PUT /api/admin/hotels/{id}/reject` - Từ chối khách sạn

### Admin - Transactions (`/api/admin/transactions`)
- `GET /api/admin/transactions` - Lấy tất cả giao dịch
- `GET /api/admin/transactions/{id}` - Lấy chi tiết giao dịch
- `PUT /api/admin/transactions/{id}/approve` - Duyệt giao dịch
- `GET /api/admin/transactions/owner/my-transactions` - Lấy giao dịch của owner
- `GET /api/admin/transactions/revenue/admin` - Lấy doanh thu admin
- `GET /api/admin/transactions/revenue/owner` - Lấy doanh thu owner

### Admin - Settings (`/api/admin/percent`)
- `GET /api/admin/percent` - Lấy tỷ lệ admin percent
- `POST /api/admin/percent` - Tạo tỷ lệ admin percent
- `PUT /api/admin/percent` - Cập nhật tỷ lệ admin percent

### Info (`/api/info`)
- `GET /api/info/company` - Lấy thông tin công ty
- `GET /api/info/faqs` - Lấy danh sách FAQ
- `GET /api/info/contact` - Lấy thông tin liên hệ
- `GET /api/info/offices` - Lấy danh sách văn phòng
- `POST /api/info/contact/message` - Gửi tin nhắn liên hệ

### Geocoding (`/api/geocoding`)
- `POST /api/geocoding/geocode-address` - Chuyển địa chỉ thành tọa độ
- `POST /api/geocoding/place-autocomplete` - Gợi ý địa chỉ
- `POST /api/geocoding/place-details` - Lấy chi tiết địa điểm

### Geocoding Admin (`/api/geocoding/admin`)
- `POST /api/geocoding/admin/geocode-all-hotels` - Geocode tất cả khách sạn
- `POST /api/geocoding/admin/geocode-hotel/{hotelId}` - Geocode một khách sạn

### Chat (`/api/chat`)
- `POST /api/chat` - Gửi tin nhắn đến AI chatbot

---

## 🗄️ Database Schema

### Các bảng chính:

1. **Users** - Người dùng
   - id, username, email, password, phone, verified, role_id, otp, timeExpired

2. **Role** - Vai trò
   - id, name (USER, OWNER, ADMIN)

3. **hotel** - Khách sạn
   - id, name, address, city, phone, description, image, rating, status, deleted, latitude, longitude, owner_user

4. **hotel_images** - Ảnh khách sạn
   - id, image_url, display_order, hotel_id, deleted

5. **rooms** - Phòng
   - id, number, type, price, capacity, discount_percent, image, available, deleted, hotel_id

6. **booking** - Đặt phòng
   - id, status (PENDING/PAID/FAILED/REFUNDED), booking_date, check_in_date, check_out_date, total_price, qr_url, user_id, hotel_id, rooms_id

7. **booking_transactions** - Giao dịch đặt phòng
   - id, booking_id, hotel_id, owner_id, total_amount, admin_revenue, owner_revenue, status (pending/approved), created_at

8. **wallets** - Ví
   - id, user_id, balance

9. **withdraw_history** - Lịch sử rút tiền
   - id, amount, bank_name, account_number, account_holder_name, status (pending/resolved/rejected), user_id, created_at

10. **wallet_transaction** - Giao dịch ví
    - id, wallet_id, amount, transaction_type (PAYMENT/DEPOSIT), status (pending/success/failed), created_at

11. **hotel_reviews** - Đánh giá khách sạn
    - id, hotel_id, user_id, rating, comment, created_at

12. **Percen** - Tỷ lệ phần trăm admin
    - id, admin_percent (0.0 - 1.0)

13. **company_info** - Thông tin công ty
    - id, key, value

14. **faq** - Câu hỏi thường gặp
    - id, question, answer, display_order

15. **contact_info** - Thông tin liên hệ
    - id, type, title, content, link, display_order

16. **office** - Văn phòng
    - id, name, address, phone, email, hours, latitude, longitude, display_order

17. **contact_message** - Tin nhắn liên hệ
    - id, name, email, phone, message, created_at, is_read

---

## 📝 Ghi chú

### Frontend
- Tất cả các form đều sử dụng `react-hook-form` + `zod` để validate
- Tất cả các trang đều responsive (mobile, tablet, desktop)
- JWT token được lưu trong localStorage
- Axios interceptors tự động thêm token vào header
- ProtectedRoute component bảo vệ routes theo role
- Toast notification system để hiển thị thông báo
- FormattedNumberInput component để format số tiền (1.000.000 VND)
- Custom hooks: useToast cho toast notifications
- React Context: ToastContext cho quản lý toast global

### Backend
- Soft delete: các bản ghi không bị xóa thật, chỉ đánh dấu `deleted = true`
- Image upload sử dụng Cloudinary (tự động upload khi tạo/sửa hotel/room)
- QR Code generation sử dụng ZXing library (Google)
- QR code được lưu tại: `uploads/qr/qr_booking_{id}.png`
- Payment tích hợp VNPay sandbox
- Email OTP sử dụng Gmail SMTP
- Spring Security với role-based access control (@PreAuthorize)
- JWT token có thời hạn (cấu hình trong SecurityConfig)
- CORS được cấu hình để cho phép FE gọi API

### Database
- Sử dụng MySQL 8.0 với encoding UTF-8 (utf8mb4)
- Foreign key constraints được thiết lập
- Indexes được tạo cho các trường thường query
- Soft delete pattern: `deleted` boolean field

### Tính năng đặc biệt
- QR Code: Tự động tạo khi tạo booking, chứa thông tin booking
- Geocoding: Tự động chuyển đổi địa chỉ thành lat/lng khi tạo hotel
- AI Chat: Tích hợp OpenAI, tự động tìm và gợi ý khách sạn
- OAuth2: Đăng nhập Google, tự động tạo tài khoản
- Revenue splitting: Tự động phân chia doanh thu giữa admin và owner
- Wallet system: Mỗi user có ví riêng, tự động cập nhật khi có giao dịch

---

## 👥 Vai trò người dùng

### USER (Người dùng)
- Tìm kiếm, xem khách sạn
- Đặt phòng, thanh toán
- Xem lịch sử đặt phòng
- Viết đánh giá

### OWNER (Chủ khách sạn)
- Tất cả quyền của USER
- Quản lý khách sạn (tạo, sửa, xóa)
- Quản lý phòng
- Xem doanh thu
- Yêu cầu rút tiền

### ADMIN (Quản trị viên)
- Tất cả quyền của USER
- Duyệt/từ chối khách sạn
- Quản lý tất cả khách sạn
- Quản lý giao dịch
- Quản lý yêu cầu rút tiền
- Xem tổng doanh thu hệ thống
- Cấu hình admin percent

---

## 🔐 Bảo mật

- JWT authentication
- Spring Security với role-based access control
- Password được hash với BCrypt
- OAuth2 cho Google login
- CORS được cấu hình
- Input validation ở cả FE và BE
- SQL injection được ngăn chặn bởi JPA/Hibernate

---
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

1. **Environment Variables**: 
   - Hệ thống sử dụng environment variables để bảo mật thông tin nhạy cảm
   - Tất cả các giá trị nhạy cảm (passwords, API keys) nên được set qua environment variables
   - Xem chi tiết trong phần [Cấu hình môi trường](#cấu-hình-môi-trường) ở trên
   - **KHÔNG commit file `.env` vào git!** File đã được thêm vào `.gitignore`
   - Sử dụng `application.properties.example` và `.env.example` làm template

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

