# Hướng dẫn sử dụng Environment Variables

## Cấu hình

1. **Tạo file `.env` từ template:**
   ```bash
   cp .env.example .env
   ```

2. **Chỉnh sửa file `.env`** với các giá trị thực tế của bạn:
   - Database credentials
   - Email configuration
   - VNPAY credentials
   - Google OAuth credentials
   - OpenAI API key

3. **Chạy ứng dụng:**
   ```bash
   ./run.sh
   ```
   
   Script `run.sh` sẽ tự động load các biến môi trường từ file `.env` trước khi chạy ứng dụng.

## Lưu ý

- File `.env` đã được thêm vào `.gitignore` để không commit lên git
- File `.env.example` là template mẫu, có thể commit lên git
- Tất cả các giá trị nhạy cảm đã được di chuyển từ `application.properties` sang `.env`
- `application.properties` giờ chỉ chứa các giá trị mặc định và đọc từ biến môi trường

## Các biến môi trường cần thiết

### Database
- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`

### Mail
- `SPRING_MAIL_USERNAME`
- `SPRING_MAIL_PASSWORD`

### VNPAY
- `VNPAY_TMN_CODE`
- `VNPAY_HASH_SECRET`

### Google OAuth
- `SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_ID`
- `SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_SECRET`
- `SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_REDIRECT_URI`

### OpenAI
- `OPENAI_API_KEY`

