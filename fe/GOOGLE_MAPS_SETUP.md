# Hướng dẫn cấu hình Google Maps API

## Lỗi: RefererNotAllowedMapError

Lỗi này xảy ra khi Google Maps API key chưa được cấu hình đúng domain restrictions.

## Cách sửa lỗi:

### Bước 1: Vào Google Cloud Console
1. Truy cập: https://console.cloud.google.com/apis/credentials
2. Chọn project của bạn
3. Tìm API key bạn đang sử dụng (hoặc tạo mới)

### Bước 2: Cấu hình API Key Restrictions
1. Click vào API key bạn muốn sử dụng
2. Trong phần "Application restrictions":
   - Chọn "HTTP referrers (web sites)"
   - Thêm các URL sau:
     ```
     http://localhost:3000/*
     http://localhost:3000
     http://127.0.0.1:3000/*
     http://127.0.0.1:3000
     ```
   - Nếu deploy lên production, thêm domain của bạn:
     ```
     https://yourdomain.com/*
     https://yourdomain.com
     ```

3. Trong phần "API restrictions":
   - Chọn "Restrict key"
   - Bật các API sau:
     - Maps JavaScript API
     - Maps Embed API
     - Places API (nếu cần)

### Bước 3: Lưu và chờ vài phút
- Sau khi cấu hình, đợi 2-5 phút để thay đổi có hiệu lực
- Refresh lại trang web

## Giải pháp tạm thời

Nếu không muốn cấu hình API key ngay, component sẽ tự động sử dụng Google Maps Embed API (iframe) - không cần cấu hình domain restrictions.

## Lưu ý

- OAuth Client ID không phải là Maps API Key
- Bạn cần tạo Maps API Key riêng từ Google Cloud Console
- Maps API Key miễn phí có giới hạn requests mỗi tháng

