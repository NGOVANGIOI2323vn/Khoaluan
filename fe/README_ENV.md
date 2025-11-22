# Hướng dẫn sử dụng Environment Variables (Frontend)

## Cấu hình

1. **Tạo file `.env` từ template:**
   ```bash
   cp .env.example .env
   ```

2. **Chỉnh sửa file `.env`** với các giá trị thực tế của bạn:
   - Google Maps API Key
   - Google OAuth Client ID và Secret (nếu cần)

3. **Chạy ứng dụng:**
   ```bash
   npm run dev
   ```
   
   Vite sẽ tự động load các biến môi trường từ file `.env`.

## Lưu ý

- File `.env` đã được thêm vào `.gitignore` để không commit lên git
- File `.env.example` là template mẫu, có thể commit lên git
- Tất cả các biến môi trường phải có prefix `VITE_` để Vite có thể đọc được

## Các biến môi trường

### Google Maps
- `VITE_GOOGLE_MAPS_API_KEY` - API key cho Google Maps JavaScript API và Embed API

### Google OAuth (tùy chọn)
- `VITE_GOOGLE_CLIENT_ID` - Client ID cho Google OAuth
- `VITE_GOOGLE_CLIENT_SECRET` - Client Secret cho Google OAuth

### Cloudinary (Bắt buộc cho upload ảnh)
- `VITE_CLOUDINARY_CLOUD_NAME` - Cloud name từ Cloudinary dashboard
- `VITE_CLOUDINARY_API_KEY` - API Key từ Cloudinary dashboard
- `VITE_CLOUDINARY_API_SECRET` - API Secret từ Cloudinary dashboard (không bắt buộc cho unsigned upload)
- `VITE_CLOUDINARY_UPLOAD_PRESET` - Upload preset name (ví dụ: "hotels")

## Sử dụng trong code

```typescript
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
```

