# Hướng dẫn Debug Kết nối FE-BE

## Các vấn đề đã kiểm tra và sửa:

1. ✅ **CORS Configuration**: Đã kiểm tra và xác nhận CORS đang hoạt động đúng
2. ✅ **Backend Response**: Backend đang trả về dữ liệu đúng (đã test bằng curl)
3. ✅ **API Base URL**: Đã cấu hình đúng `http://localhost:8081/api`
4. ✅ **Logging**: Đã thêm logging chi tiết để debug

## Các bước kiểm tra:

### 1. Kiểm tra Backend đang chạy:
```bash
curl http://localhost:8081/api/hotels
```
Nếu trả về JSON data thì backend đang chạy tốt.

### 2. Kiểm tra Frontend đang chạy:
- Mở browser và vào `http://localhost:3000` (hoặc port mà Vite đang chạy)
- Mở Developer Tools (F12)
- Vào tab **Console** và xem có log nào không:
  - Sẽ thấy: `API Base URL: http://localhost:8081/api`
  - Sẽ thấy các log request/response

### 3. Kiểm tra Network Requests:
- Vào tab **Network** trong Developer Tools
- Refresh trang
- Tìm các request đến `/api/hotels`
- Click vào request và xem:
  - **Status**: Phải là 200 (OK)
  - **Response**: Phải có dữ liệu JSON
  - **Headers**: Kiểm tra `Access-Control-Allow-Origin` có giá trị `http://localhost:3000` (hoặc port FE đang chạy)

### 4. Các lỗi thường gặp:

#### Lỗi CORS:
- **Triệu chứng**: Console có lỗi `CORS policy` hoặc `Access-Control-Allow-Origin`
- **Giải pháp**: 
  - Kiểm tra port FE đang chạy (có thể là 5173 thay vì 3000)
  - Thêm port đó vào `CorsConfig.java` nếu chưa có

#### Lỗi Connection Refused:
- **Triệu chứng**: Console có lỗi `ERR_CONNECTION_REFUSED` hoặc `Network Error`
- **Giải pháp**: 
  - Kiểm tra backend có đang chạy không
  - Kiểm tra port 8081 có đúng không

#### Lỗi Timeout:
- **Triệu chứng**: Request bị timeout sau 30 giây
- **Giải pháp**: 
  - Kiểm tra backend có đang xử lý request không
  - Kiểm tra database connection

#### Không có dữ liệu hiển thị:
- **Triệu chứng**: Request thành công nhưng không có dữ liệu
- **Giải pháp**: 
  - Kiểm tra console log để xem cấu trúc response
  - Kiểm tra code xử lý response trong `Home.tsx`

## Cấu hình Port:

- **Backend**: Port 8081 (cấu hình trong `application.properties`)
- **Frontend**: Port 3000 (cấu hình trong `vite.config.ts`)
- **CORS**: Cho phép cả `localhost:3000` và `localhost:5173` (Vite default port)

## Environment Variables:

Nếu muốn thay đổi API URL, tạo file `.env` trong thư mục `FE/`:
```
VITE_API_URL=http://localhost:8081
```

## Test Connection:

Mở browser console và chạy:
```javascript
fetch('http://localhost:8081/api/hotels')
  .then(r => r.json())
  .then(data => console.log('Backend response:', data))
  .catch(err => console.error('Error:', err))
```

Nếu test này thành công nhưng app không hoạt động, vấn đề có thể ở cách xử lý response trong code.

