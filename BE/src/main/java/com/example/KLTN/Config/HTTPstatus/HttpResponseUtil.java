package com.example.KLTN.Config.HTTPstatus;

import com.example.KLTN.dto.Apireponsi;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

/**
 * ✅ HttpResponseUtil
 * Tiện ích giúp tạo ResponseEntity chuẩn REST (chuẩn JSON format),
 * tránh việc lặp code trong các Controller (đặc biệt là khi xử lý login, register, CRUD...).
 *
 * Dạng phản hồi:
 * {
 *   "status": 200,
 *   "message": "Login thành công",
 *   "data": {...},
 *   "error": null
 * }
 */
@Component
public class HttpResponseUtil {

    /**
     * ✅ Trả về 200 OK (thành công)
     */
    public <T> ResponseEntity<Apireponsi<T>> ok(String message) {
        return buildResponse(HttpStatus.OK, message, null, null);
    }

    /**
     * ✅ Trả về 200 OK kèm data
     */
    public <T> ResponseEntity<Apireponsi<T>> ok(String message, T data) {
        return buildResponse(HttpStatus.OK, message, data, null);
    }

    /**
     * ✅ Trả về 201 Created (khi tạo mới thành công)
     */
    public <T> ResponseEntity<Apireponsi<T>> created(String message, T data) {
        return buildResponse(HttpStatus.CREATED, message, data, null);
    }

    /**
     * ⚠️ Trả về 409 Conflict (xung đột dữ liệu, ví dụ: username/email đã tồn tại)
     */
    public <T> ResponseEntity<Apireponsi<T>> conflict(String message) {
        return buildResponse(HttpStatus.CONFLICT, message, null, null);
    }

    /**
     * ⚠️ Trả về 400 Bad Request (yêu cầu không hợp lệ)
     */
    public <T> ResponseEntity<Apireponsi<T>> badRequest(String message) {
        return buildResponse(HttpStatus.BAD_REQUEST, message, null, null);
    }

    /**
     * ⚠️ Trả về 404 Not Found (không tìm thấy dữ liệu)
     */
    public <T> ResponseEntity<Apireponsi<T>> notFound(String message) {
        return buildResponse(HttpStatus.NOT_FOUND, message, null, null);
    }

    /**
     * ⚠️ Trả về 401 Unauthorized (chưa đăng nhập hoặc token không hợp lệ)
     */
    public <T> ResponseEntity<Apireponsi<T>> unauthorized(String message) {
        return buildResponse(HttpStatus.UNAUTHORIZED, message, null, null);
    }

    /**
     * ❌ Trả về 500 Internal Server Error (lỗi hệ thống)
     */
    public <T> ResponseEntity<Apireponsi<T>> error(String message, Exception e) {
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, message, null, e.getMessage());
    }

    /**
     * 🧩 Hàm chung tạo ResponseEntity
     */
    private <T> ResponseEntity<Apireponsi<T>> buildResponse(HttpStatus status, String message, T data, String error) {
        return ResponseEntity.status(status).body(new Apireponsi<>(status, message, data, error));
    }
}
