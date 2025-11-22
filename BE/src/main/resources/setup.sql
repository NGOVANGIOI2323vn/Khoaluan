-- ============================================
-- COMPLETE DATABASE SETUP SCRIPT
-- Chạy file này để tạo database và seed dữ liệu hoàn chỉnh
-- File này đã gộp tất cả các file SQL thành 1 file duy nhất
-- ============================================

-- Set UTF-8 encoding
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET character_set_connection = utf8mb4;

-- ============================================
-- PART 1: CREATE TABLES FOR INFO/ABOUT/CONTACT
-- ============================================

-- Company Info Table
CREATE TABLE IF NOT EXISTS company_info (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(255) NOT NULL UNIQUE,
    `value` TEXT,
    INDEX idx_key (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- FAQ Table
CREATE TABLE IF NOT EXISTS faq (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    display_order INT DEFAULT 0,
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contact Info Table
CREATE TABLE IF NOT EXISTS contact_info (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    link VARCHAR(500),
    display_order INT DEFAULT 0,
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Office Table
CREATE TABLE IF NOT EXISTS office (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    hours VARCHAR(255),
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    display_order INT DEFAULT 0,
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contact Message Table
CREATE TABLE IF NOT EXISTS contact_message (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    INDEX idx_created_at (created_at),
    INDEX idx_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Hotel Images Table (nhiều ảnh cho mỗi khách sạn)
CREATE TABLE IF NOT EXISTS hotel_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    image_url VARCHAR(500) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    hotel_id BIGINT NOT NULL,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (hotel_id) REFERENCES hotel(id) ON DELETE CASCADE,
    INDEX idx_hotel_id (hotel_id),
    INDEX idx_display_order (display_order),
    INDEX idx_deleted (deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admin Percent Table
CREATE TABLE IF NOT EXISTS Percen (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    adminPercent DOUBLE NOT NULL DEFAULT 0.1,
    CHECK (adminPercent >= 0 AND adminPercent <= 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Wallets Table
CREATE TABLE IF NOT EXISTS wallets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    balance DECIMAL(20, 2) NOT NULL DEFAULT 0.00,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PART 2: SEED DATA FOR MAIN APPLICATION
-- ============================================

-- ============================================
-- XÓA DỮ LIỆU DUPLICATE (Tự động xóa duplicate trước khi insert)
-- ============================================
-- Xóa duplicate data để tránh lỗi khi chạy script nhiều lần
-- Logic: Giữ lại bản ghi có ID nhỏ nhất, xóa các bản duplicate
-- Đảm bảo database luôn có dữ liệu chuẩn khi chạy lại script này

-- Tắt foreign key checks tạm thời để xóa duplicate dễ dàng hơn
SET FOREIGN_KEY_CHECKS = 0;

-- Xóa duplicate hotels TRƯỚC (vì các bảng khác phụ thuộc vào hotels)
-- Xóa các bản ghi liên quan của hotels duplicate trước
DELETE r FROM rooms r
INNER JOIN hotel h1 ON r.hotel_id = h1.id
INNER JOIN hotel h2 
ON h1.name = h2.name 
AND h1.owner_user = h2.owner_user
AND h1.deleted = h2.deleted
WHERE h1.id > h2.id;

DELETE hi FROM hotel_images hi
INNER JOIN hotel h1 ON hi.hotel_id = h1.id
INNER JOIN hotel h2 
ON h1.name = h2.name 
AND h1.owner_user = h2.owner_user
AND h1.deleted = h2.deleted
WHERE h1.id > h2.id;

DELETE hr FROM hotel_reviews hr
INNER JOIN hotel h1 ON hr.hotel_id = h1.id
INNER JOIN hotel h2 
ON h1.name = h2.name 
AND h1.owner_user = h2.owner_user
AND h1.deleted = h2.deleted
WHERE h1.id > h2.id;

DELETE b FROM booking b
INNER JOIN hotel h1 ON b.hotel_id = h1.id
INNER JOIN hotel h2 
ON h1.name = h2.name 
AND h1.owner_user = h2.owner_user
AND h1.deleted = h2.deleted
WHERE h1.id > h2.id;

-- Xóa duplicate hotels (giữ lại bản có ID nhỏ nhất)
DELETE h1 FROM hotel h1
INNER JOIN hotel h2 
ON h1.name = h2.name 
AND h1.owner_user = h2.owner_user
AND h1.deleted = h2.deleted
WHERE h1.id > h2.id;

-- Xóa duplicate hotel_images (giữ lại bản có ID nhỏ nhất)
DELETE hi1 FROM hotel_images hi1
INNER JOIN hotel_images hi2 
ON hi1.hotel_id = hi2.hotel_id 
AND hi1.image_url = hi2.image_url 
AND hi1.display_order = hi2.display_order
AND hi1.deleted = hi2.deleted
WHERE hi1.id > hi2.id;

-- Xóa duplicate hotel_reviews (giữ lại bản có ID nhỏ nhất)
DELETE hr1 FROM hotel_reviews hr1
INNER JOIN hotel_reviews hr2 
ON hr1.hotel_id = hr2.hotel_id 
AND hr1.user_id = hr2.user_id
WHERE hr1.id > hr2.id;

-- Xóa duplicate bookings (giữ lại bản có ID nhỏ nhất)
DELETE b1 FROM booking b1
INNER JOIN booking b2 
ON b1.user_id = b2.user_id 
AND b1.hotel_id = b2.hotel_id 
AND b1.rooms_id = b2.rooms_id 
AND b1.check_in_date = b2.check_in_date
WHERE b1.id > b2.id;

-- Xóa duplicate rooms (giữ lại bản có ID nhỏ nhất)
DELETE r1 FROM rooms r1
INNER JOIN rooms r2 
ON r1.Number = r2.Number 
AND r1.hotel_id = r2.hotel_id
AND r1.deleted = r2.deleted
WHERE r1.id > r2.id;

-- Xóa duplicate contact_info (giữ lại bản có ID nhỏ nhất)
DELETE ci1 FROM contact_info ci1
INNER JOIN contact_info ci2 
ON ci1.type = ci2.type 
AND ci1.display_order = ci2.display_order
WHERE ci1.id > ci2.id;

-- Xóa duplicate office (giữ lại bản có ID nhỏ nhất)
DELETE o1 FROM office o1
INNER JOIN office o2 
ON o1.name = o2.name
WHERE o1.id > o2.id;

-- Xóa duplicate faq (giữ lại bản có ID nhỏ nhất)
DELETE f1 FROM faq f1
INNER JOIN faq f2 
ON f1.question = f2.question
WHERE f1.id > f2.id;

-- Xóa duplicate company_info (giữ lại bản có ID nhỏ nhất)
DELETE ci1 FROM company_info ci1
INNER JOIN company_info ci2 
ON ci1.`key` = ci2.`key`
WHERE ci1.id > ci2.id;

-- Xóa duplicate booking_transactions (nếu bảng tồn tại)
-- Giữ lại bản có ID nhỏ nhất dựa trên booking_id và status
-- Sử dụng điều kiện để chỉ xóa nếu bảng tồn tại
SET @table_exists = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'booking_transactions');
SET @sql = IF(@table_exists > 0, 
    'DELETE bt1 FROM booking_transactions bt1 INNER JOIN booking_transactions bt2 ON bt1.booking_id = bt2.booking_id AND bt1.status = bt2.status WHERE bt1.id > bt2.id',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Xóa duplicate WithDrawHistory (nếu bảng tồn tại)
-- Giữ lại bản có ID nhỏ nhất dựa trên wallet_id, amount, create_AT, status
SET @table_exists = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'WithDrawHistory');
SET @sql = IF(@table_exists > 0, 
    'DELETE wh1 FROM WithDrawHistory wh1 INNER JOIN WithDrawHistory wh2 ON wh1.wallet_id = wh2.wallet_id AND wh1.amount = wh2.amount AND DATE(wh1.create_AT) = DATE(wh2.create_AT) AND wh1.status = wh2.status WHERE wh1.id > wh2.id',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Xóa duplicate wallet_transaction (nếu bảng tồn tại)
-- Giữ lại bản có ID nhỏ nhất dựa trên user_id, amount, type, created_at
-- Lưu ý: Bảng này có thể chưa tồn tại, nên bỏ qua nếu có lỗi
SET @table_exists = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'wallet_transaction');
SET @sql = IF(@table_exists > 0, 
    'DELETE wt1 FROM wallet_transaction wt1 INNER JOIN wallet_transaction wt2 ON wt1.user_id = wt2.user_id AND wt1.amount = wt2.amount AND wt1.type = wt2.type AND DATE(wt1.created_at) = DATE(wt2.created_at) WHERE wt1.id > wt2.id',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Bật lại foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- XÓA DỮ LIỆU CŨ (CHỈ CHẠY KHI CẦN RESET DATABASE)
-- ============================================
-- Phần này chỉ cần chạy khi bạn muốn xóa dữ liệu cũ và insert lại
-- Nếu database mới (chưa có dữ liệu), có thể bỏ qua phần này
-- Để sử dụng, bỏ comment các dòng dưới đây:

/*
-- Tắt foreign key checks tạm thời để xóa dễ dàng hơn
SET FOREIGN_KEY_CHECKS = 0;

-- Xóa bookings cũ (nếu có) - sử dụng JOIN thay vì subquery
DELETE b FROM booking b
INNER JOIN users u ON b.user_id = u.id
WHERE u.username IN ('user1', 'user2');

DELETE b FROM booking b
INNER JOIN hotel h ON b.hotel_id = h.id
INNER JOIN users u ON h.owner_user = u.id
WHERE u.username IN ('owner1', 'owner2');

-- Xóa hotel reviews cũ
DELETE hr FROM hotel_reviews hr
INNER JOIN hotel h ON hr.hotel_id = h.id
INNER JOIN users u ON h.owner_user = u.id
WHERE u.username IN ('owner1', 'owner2');

-- Xóa rooms cũ
DELETE r FROM rooms r
INNER JOIN hotel h ON r.hotel_id = h.id
INNER JOIN users u ON h.owner_user = u.id
WHERE u.username IN ('owner1', 'owner2');

-- Xóa hotel images cũ
DELETE hi FROM hotel_images hi
INNER JOIN hotel h ON hi.hotel_id = h.id
INNER JOIN users u ON h.owner_user = u.id
WHERE u.username IN ('owner1', 'owner2');

-- Xóa hotels cũ (chỉ xóa hotels của owner1 và owner2 - test data)
DELETE h FROM hotel h
INNER JOIN users u ON h.owner_user = u.id
WHERE u.username IN ('owner1', 'owner2');

-- Bật lại foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
*/

-- Insert Roles
INSERT INTO roles (name) VALUES ('USER'), ('OWNER'), ('ADMIN') 
ON DUPLICATE KEY UPDATE name=name;

-- Insert Users (password is '123456' hashed with BCrypt)
-- Note: In production, use proper password hashing
INSERT INTO users (username, email, password, phone, verified, role_id) VALUES
('admin', 'admin@example.com', '$2a$10$2AEeyTKsAglG1sBCTRq8iejxABBLCMiLPjJHsZ/yUJEB6FUVt4kKO', '0123456789', true, (SELECT id FROM roles WHERE name = 'ADMIN' LIMIT 1)),
('owner1', 'owner1@example.com', '$2a$10$2AEeyTKsAglG1sBCTRq8iejxABBLCMiLPjJHsZ/yUJEB6FUVt4kKO', '0123456780', true, (SELECT id FROM roles WHERE name = 'OWNER' LIMIT 1)),
('owner2', 'owner2@example.com', '$2a$10$2AEeyTKsAglG1sBCTRq8iejxABBLCMiLPjJHsZ/yUJEB6FUVt4kKO', '0123456781', true, (SELECT id FROM roles WHERE name = 'OWNER' LIMIT 1)),
('user1', 'user1@example.com', '$2a$10$2AEeyTKsAglG1sBCTRq8iejxABBLCMiLPjJHsZ/yUJEB6FUVt4kKO', '0123456782', true, (SELECT id FROM roles WHERE name = 'USER' LIMIT 1)),
('user2', 'user2@example.com', '$2a$10$2AEeyTKsAglG1sBCTRq8iejxABBLCMiLPjJHsZ/yUJEB6FUVt4kKO', '0123456783', true, (SELECT id FROM roles WHERE name = 'USER' LIMIT 1))
ON DUPLICATE KEY UPDATE 
  email=VALUES(email),
  password=VALUES(password),
  phone=VALUES(phone),
  verified=VALUES(verified),
  role_id=VALUES(role_id);

-- Insert Wallets for users (using subquery to get actual user IDs)
-- Sử dụng INSERT IGNORE để tránh duplicate, nếu đã có thì giữ nguyên balance hiện tại
INSERT IGNORE INTO wallets (user_id, balance) 
SELECT id, 10000000.00 FROM users WHERE username = 'admin';

INSERT IGNORE INTO wallets (user_id, balance) 
SELECT id, 5000000.00 FROM users WHERE username = 'owner1';

INSERT IGNORE INTO wallets (user_id, balance) 
SELECT id, 5000000.00 FROM users WHERE username = 'owner2';

INSERT IGNORE INTO wallets (user_id, balance) 
SELECT id, 2000000.00 FROM users WHERE username = 'user1';

INSERT IGNORE INTO wallets (user_id, balance) 
SELECT id, 2000000.00 FROM users WHERE username = 'user2';

-- Đảm bảo tất cả users đều có wallet (nếu chưa có thì tạo với balance = 0)
INSERT IGNORE INTO wallets (user_id, balance)
SELECT id, 0.00 FROM users
WHERE id NOT IN (SELECT user_id FROM wallets);

-- Xóa duplicate hotels (giữ lại bản có ID nhỏ nhất dựa trên name và owner_user)
DELETE h1 FROM hotel h1
INNER JOIN hotel h2 
ON h1.name = h2.name 
AND h1.owner_user = h2.owner_user
AND h1.deleted = h2.deleted
WHERE h1.id > h2.id;

-- Xóa duplicate hotels TRƯỚC KHI INSERT (đảm bảo không có duplicate)
SET FOREIGN_KEY_CHECKS = 0;
DELETE h1 FROM hotel h1
INNER JOIN hotel h2 
ON h1.name = h2.name 
AND h1.owner_user = h2.owner_user
AND h1.deleted = h2.deleted
WHERE h1.id > h2.id;
SET FOREIGN_KEY_CHECKS = 1;

-- Insert Hotels (using subquery to get owner user IDs)
-- Sử dụng INSERT IGNORE để tránh duplicate khi chạy lại script
INSERT IGNORE INTO hotel (name, address, city, phone, description, image, rating, status, owner_user, deleted) VALUES
('Mường Thanh Hotel', '123 Đường Bạch Đằng, Quận Hải Châu', 'Đà Nẵng', '0236123456', 'Khách sạn 4 sao với view biển tuyệt đẹp, gần bãi biển Mỹ Khê', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 4, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1), FALSE),
('Century Hotel', '456 Đường Trần Phú, Quận Hải Châu', 'Đà Nẵng', '0236123457', 'Khách sạn hiện đại ở trung tâm thành phố, gần các điểm du lịch', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 5, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1), FALSE),
('Lanmard 81 Hotel', '789 Đường Nguyễn Văn Linh, Quận Thanh Khê', 'Đà Nẵng', '0236123458', 'Khách sạn giá rẻ, phù hợp cho du khách tiết kiệm', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', 3, 'success', (SELECT id FROM users WHERE username = 'owner2' LIMIT 1), FALSE),
('Vin Hotel', '321 Đường Võ Nguyên Giáp, Quận Sơn Trà', 'Đà Nẵng', '0236123459', 'Khách sạn 5 sao sang trọng với đầy đủ tiện nghi cao cấp', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', 5, 'success', (SELECT id FROM users WHERE username = 'owner2' LIMIT 1), FALSE),
('Bình An Hotel', '654 Đường Lê Duẩn, Quận Hải Châu', 'Đà Nẵng', '0236123460', 'Khách sạn 3 sao thân thiện, gần chợ và các nhà hàng', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', 4, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1), FALSE);

-- Insert Hotel Images (nhiều ảnh cho mỗi khách sạn)
-- Sử dụng INSERT IGNORE để tránh duplicate
INSERT IGNORE INTO hotel_images (image_url, display_order, hotel_id, deleted) VALUES
-- Mường Thanh Hotel - 4 ảnh
('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 0, (SELECT id FROM hotel WHERE name = 'Mường Thanh Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 1, (SELECT id FROM hotel WHERE name = 'Mường Thanh Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', 2, (SELECT id FROM hotel WHERE name = 'Mường Thanh Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', 3, (SELECT id FROM hotel WHERE name = 'Mường Thanh Hotel' LIMIT 1), FALSE),
-- Century Hotel - 5 ảnh
('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 0, (SELECT id FROM hotel WHERE name = 'Century Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 1, (SELECT id FROM hotel WHERE name = 'Century Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', 2, (SELECT id FROM hotel WHERE name = 'Century Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', 3, (SELECT id FROM hotel WHERE name = 'Century Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', 4, (SELECT id FROM hotel WHERE name = 'Century Hotel' LIMIT 1), FALSE),
-- Lanmard 81 Hotel - 3 ảnh
('https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', 0, (SELECT id FROM hotel WHERE name = 'Lanmard 81 Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800', 1, (SELECT id FROM hotel WHERE name = 'Lanmard 81 Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', 2, (SELECT id FROM hotel WHERE name = 'Lanmard 81 Hotel' LIMIT 1), FALSE),
-- Vin Hotel - 5 ảnh
('https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', 0, (SELECT id FROM hotel WHERE name = 'Vin Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 1, (SELECT id FROM hotel WHERE name = 'Vin Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 2, (SELECT id FROM hotel WHERE name = 'Vin Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', 3, (SELECT id FROM hotel WHERE name = 'Vin Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', 4, (SELECT id FROM hotel WHERE name = 'Vin Hotel' LIMIT 1), FALSE),
-- Bình An Hotel - 4 ảnh
('https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', 0, (SELECT id FROM hotel WHERE name = 'Bình An Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800', 1, (SELECT id FROM hotel WHERE name = 'Bình An Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', 2, (SELECT id FROM hotel WHERE name = 'Bình An Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', 3, (SELECT id FROM hotel WHERE name = 'Bình An Hotel' LIMIT 1), FALSE);

-- Insert Rooms
INSERT INTO rooms (Number, type, status, price, capacity, image, discount_percent, hotel_id, deleted) VALUES
-- Rooms for Hotel 1 (Mường Thanh Hotel)
('101', 'DELUXE', 'AVAILABLE', 1500000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.1, (SELECT id FROM hotel WHERE name = 'Mường Thanh Hotel' LIMIT 1), FALSE),
('102', 'STANDARD', 'AVAILABLE', 1200000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Mường Thanh Hotel' LIMIT 1), FALSE),
('103', 'SUITE', 'AVAILABLE', 2000000, 4, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.15, (SELECT id FROM hotel WHERE name = 'Mường Thanh Hotel' LIMIT 1), FALSE),
('201', 'DELUXE', 'AVAILABLE', 1600000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Mường Thanh Hotel' LIMIT 1), FALSE),
('202', 'FAMILY', 'AVAILABLE', 1800000, 4, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.1, (SELECT id FROM hotel WHERE name = 'Mường Thanh Hotel' LIMIT 1), FALSE),

-- Rooms for Hotel 2 (Century Hotel)
('301', 'EXECUTIVE', 'AVAILABLE', 2500000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.2, (SELECT id FROM hotel WHERE name = 'Century Hotel' LIMIT 1), FALSE),
('302', 'SUITE', 'AVAILABLE', 3000000, 4, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.15, (SELECT id FROM hotel WHERE name = 'Century Hotel' LIMIT 1), FALSE),
('303', 'DELUXE', 'AVAILABLE', 2000000, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.1, (SELECT id FROM hotel WHERE name = 'Century Hotel' LIMIT 1), FALSE),

-- Rooms for Hotel 3 (Lanmard 81 Hotel)
('401', 'STANDARD', 'AVAILABLE', 800000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Lanmard 81 Hotel' LIMIT 1), FALSE),
('402', 'STANDARD', 'AVAILABLE', 850000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.05, (SELECT id FROM hotel WHERE name = 'Lanmard 81 Hotel' LIMIT 1), FALSE),
('403', 'FAMILY', 'AVAILABLE', 1200000, 4, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Lanmard 81 Hotel' LIMIT 1), FALSE),

-- Rooms for Hotel 4 (Vin Hotel)
('501', 'SUITE', 'AVAILABLE', 4000000, 4, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.25, (SELECT id FROM hotel WHERE name = 'Vin Hotel' LIMIT 1), FALSE),
('502', 'EXECUTIVE', 'AVAILABLE', 3500000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.2, (SELECT id FROM hotel WHERE name = 'Vin Hotel' LIMIT 1), FALSE),
('503', 'DELUXE', 'AVAILABLE', 3000000, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.15, (SELECT id FROM hotel WHERE name = 'Vin Hotel' LIMIT 1), FALSE),

-- Rooms for Hotel 5 (Bình An Hotel)
('601', 'STANDARD', 'AVAILABLE', 1000000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Bình An Hotel' LIMIT 1), FALSE),
('602', 'DELUXE', 'AVAILABLE', 1300000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.1, (SELECT id FROM hotel WHERE name = 'Bình An Hotel' LIMIT 1), FALSE),
('603', 'FAMILY', 'AVAILABLE', 1500000, 4, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Bình An Hotel' LIMIT 1), FALSE);

-- Insert Hotel Reviews (sử dụng INSERT IGNORE để tránh duplicate)
INSERT IGNORE INTO hotel_reviews (rating, comment, hotel_id, user_id) VALUES
(5, 'Khách sạn rất đẹp, view biển tuyệt vời! Nhân viên phục vụ nhiệt tình.', (SELECT id FROM hotel WHERE name = 'Mường Thanh Hotel' LIMIT 1), (SELECT id FROM users WHERE username = 'user1' LIMIT 1)),
(4, 'Phòng sạch sẽ, giá cả hợp lý. Sẽ quay lại lần sau.', (SELECT id FROM hotel WHERE name = 'Mường Thanh Hotel' LIMIT 1), (SELECT id FROM users WHERE username = 'user2' LIMIT 1)),
(5, 'Khách sạn 5 sao đúng nghĩa! Mọi thứ đều hoàn hảo.', (SELECT id FROM hotel WHERE name = 'Century Hotel' LIMIT 1), (SELECT id FROM users WHERE username = 'user1' LIMIT 1)),
(4, 'Vị trí tốt, gần trung tâm. Phòng rộng rãi và thoáng mát.', (SELECT id FROM hotel WHERE name = 'Century Hotel' LIMIT 1), (SELECT id FROM users WHERE username = 'user2' LIMIT 1)),
(3, 'Giá rẻ nhưng chất lượng cũng tương ứng. Phù hợp cho ngân sách hạn chế.', (SELECT id FROM hotel WHERE name = 'Lanmard 81 Hotel' LIMIT 1), (SELECT id FROM users WHERE username = 'user1' LIMIT 1)),
(4, 'Khách sạn sang trọng, đầy đủ tiện nghi. Đáng giá đồng tiền.', (SELECT id FROM hotel WHERE name = 'Vin Hotel' LIMIT 1), (SELECT id FROM users WHERE username = 'user1' LIMIT 1)),
(5, 'Trải nghiệm tuyệt vời! Phòng view đẹp, dịch vụ tốt.', (SELECT id FROM hotel WHERE name = 'Vin Hotel' LIMIT 1), (SELECT id FROM users WHERE username = 'user2' LIMIT 1)),
(4, 'Khách sạn ổn, giá cả phải chăng. Nhân viên thân thiện.', (SELECT id FROM hotel WHERE name = 'Bình An Hotel' LIMIT 1), (SELECT id FROM users WHERE username = 'user1' LIMIT 1));

-- Insert Sample Bookings (sử dụng INSERT IGNORE để tránh duplicate)
INSERT IGNORE INTO booking (status, booking_date, check_in_date, check_out_date, total_price, user_id, hotel_id, rooms_id) VALUES
('PAID', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 10 DAY), 4500000, (SELECT id FROM users WHERE username = 'user1' LIMIT 1), (SELECT id FROM hotel WHERE name = 'Mường Thanh Hotel' LIMIT 1), (SELECT id FROM rooms WHERE Number = '101' AND hotel_id = (SELECT id FROM hotel WHERE name = 'Mường Thanh Hotel' LIMIT 1) LIMIT 1)),
('PENDING', NOW(), DATE_ADD(NOW(), INTERVAL 14 DAY), DATE_ADD(NOW(), INTERVAL 17 DAY), 7200000, (SELECT id FROM users WHERE username = 'user2' LIMIT 1), (SELECT id FROM hotel WHERE name = 'Century Hotel' LIMIT 1), (SELECT id FROM rooms WHERE Number = '301' AND hotel_id = (SELECT id FROM hotel WHERE name = 'Century Hotel' LIMIT 1) LIMIT 1)),
('PAID', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), NOW(), 3600000, (SELECT id FROM users WHERE username = 'user1' LIMIT 1), (SELECT id FROM hotel WHERE name = 'Lanmard 81 Hotel' LIMIT 1), (SELECT id FROM rooms WHERE Number = '401' AND hotel_id = (SELECT id FROM hotel WHERE name = 'Lanmard 81 Hotel' LIMIT 1) LIMIT 1)),
('PAID', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY), 5400000, (SELECT id FROM users WHERE username = 'user1' LIMIT 1), (SELECT id FROM hotel WHERE name = 'Vin Hotel' LIMIT 1), (SELECT id FROM rooms WHERE Number = '501' AND hotel_id = (SELECT id FROM hotel WHERE name = 'Vin Hotel' LIMIT 1) LIMIT 1)),
('PENDING', NOW(), DATE_ADD(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 6 DAY), 2400000, (SELECT id FROM users WHERE username = 'user2' LIMIT 1), (SELECT id FROM hotel WHERE name = 'Bình An Hotel' LIMIT 1), (SELECT id FROM rooms WHERE Number = '601' AND hotel_id = (SELECT id FROM hotel WHERE name = 'Bình An Hotel' LIMIT 1) LIMIT 1));

-- Xóa duplicate hotels TRƯỚC KHI INSERT (đảm bảo không có duplicate)
SET FOREIGN_KEY_CHECKS = 0;
DELETE h1 FROM hotel h1
INNER JOIN hotel h2 
ON h1.name = h2.name 
AND h1.owner_user = h2.owner_user
AND h1.deleted = h2.deleted
WHERE h1.id > h2.id;
SET FOREIGN_KEY_CHECKS = 1;

-- Thêm thêm hotels (Đà Nẵng) - sử dụng INSERT IGNORE
INSERT IGNORE INTO hotel (name, address, city, phone, description, image, rating, status, owner_user, deleted) VALUES
('Sao La Hotel', '111 Đường Lê Lợi, Quận Hải Châu', 'Đà Nẵng', '0236123461', 'Khách sạn 4 sao hiện đại với view thành phố', 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', 4, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1), FALSE),
('Madonna Hotel', '222 Đường Hoàng Diệu, Quận Sơn Trà', 'Đà Nẵng', '0236123462', 'Khách sạn 3 sao gần biển, giá cả hợp lý', 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', 3, 'success', (SELECT id FROM users WHERE username = 'owner2' LIMIT 1), FALSE),
('Wind Hotel', '333 Đường Phạm Văn Đồng, Quận Sơn Trà', 'Đà Nẵng', '0236123463', 'Khách sạn boutique với phong cách độc đáo', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 4, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1), FALSE),
('SALA Hotel', '444 Đường Bạch Đằng, Quận Hải Châu', 'Đà Nẵng', '0236123464', 'Khách sạn 4 sao ven biển với hồ bơi vô cực', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 4, 'success', (SELECT id FROM users WHERE username = 'owner2' LIMIT 1), FALSE),
('Davue Hotel Da Nang', '555 Đường Trần Phú, Quận Hải Châu', 'Đà Nẵng', '0236123465', 'Khách sạn 3 sao gần trung tâm, tiện lợi', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', 3, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1), FALSE)
ON DUPLICATE KEY UPDATE name=VALUES(name), address=VALUES(address), city=VALUES(city), phone=VALUES(phone), description=VALUES(description), image=VALUES(image), rating=VALUES(rating), status=VALUES(status), deleted=FALSE;

-- Thêm rooms cho các hotels mới
INSERT INTO rooms (Number, type, status, price, capacity, image, discount_percent, hotel_id, deleted) VALUES
-- Rooms for Sao La Hotel
('701', 'DELUXE', 'AVAILABLE', 1400000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.1, (SELECT id FROM hotel WHERE name = 'Sao La Hotel' LIMIT 1), FALSE),
('702', 'STANDARD', 'AVAILABLE', 1100000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Sao La Hotel' LIMIT 1), FALSE),
('703', 'FAMILY', 'AVAILABLE', 1700000, 4, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.15, (SELECT id FROM hotel WHERE name = 'Sao La Hotel' LIMIT 1), FALSE),

-- Rooms for Madonna Hotel
('801', 'STANDARD', 'AVAILABLE', 900000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Madonna Hotel' LIMIT 1), FALSE),
('802', 'STANDARD', 'AVAILABLE', 950000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.05, (SELECT id FROM hotel WHERE name = 'Madonna Hotel' LIMIT 1), FALSE),

-- Rooms for Wind Hotel
('901', 'DELUXE', 'AVAILABLE', 1500000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.1, (SELECT id FROM hotel WHERE name = 'Wind Hotel' LIMIT 1), FALSE),
('902', 'SUITE', 'AVAILABLE', 2200000, 4, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.2, (SELECT id FROM hotel WHERE name = 'Wind Hotel' LIMIT 1), FALSE),

-- Rooms for SALA Hotel
('1001', 'DELUXE', 'AVAILABLE', 1600000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.1, (SELECT id FROM hotel WHERE name = 'SALA Hotel' LIMIT 1), FALSE),
('1002', 'SUITE', 'AVAILABLE', 2500000, 4, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.15, (SELECT id FROM hotel WHERE name = 'SALA Hotel' LIMIT 1), FALSE),
('1003', 'EXECUTIVE', 'AVAILABLE', 2000000, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.12, (SELECT id FROM hotel WHERE name = 'SALA Hotel' LIMIT 1), FALSE),

-- Rooms for Davue Hotel Da Nang
('1101', 'STANDARD', 'AVAILABLE', 700000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Davue Hotel Da Nang' LIMIT 1), FALSE),
('1102', 'STANDARD', 'AVAILABLE', 750000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Davue Hotel Da Nang' LIMIT 1), FALSE),
('1103', 'FAMILY', 'AVAILABLE', 1100000, 4, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.1, (SELECT id FROM hotel WHERE name = 'Davue Hotel Da Nang' LIMIT 1), FALSE);

-- Thêm thêm reviews
INSERT IGNORE INTO hotel_reviews (rating, comment, hotel_id, user_id) VALUES
(5, 'Khách sạn mới, sạch sẽ và hiện đại. Rất hài lòng!', (SELECT id FROM hotel WHERE name = 'Sao La Hotel' LIMIT 1), (SELECT id FROM users WHERE username = 'user1' LIMIT 1)),
(4, 'Giá cả hợp lý, phòng đẹp. Nhân viên nhiệt tình.', (SELECT id FROM hotel WHERE name = 'Sao La Hotel' LIMIT 1), (SELECT id FROM users WHERE username = 'user2' LIMIT 1)),
(4, 'Vị trí tốt, gần biển. Phù hợp cho gia đình.', (SELECT id FROM hotel WHERE name = 'Madonna Hotel' LIMIT 1), (SELECT id FROM users WHERE username = 'user1' LIMIT 1)),
(3, 'Khách sạn ổn, giá rẻ nhưng cần cải thiện dịch vụ.', (SELECT id FROM hotel WHERE name = 'Madonna Hotel' LIMIT 1), (SELECT id FROM users WHERE username = 'user2' LIMIT 1)),
(5, 'Khách sạn boutique rất đẹp! Phong cách độc đáo.', (SELECT id FROM hotel WHERE name = 'Wind Hotel' LIMIT 1), (SELECT id FROM users WHERE username = 'user1' LIMIT 1)),
(4, 'Phòng rộng rãi, view đẹp. Sẽ quay lại.', (SELECT id FROM hotel WHERE name = 'Wind Hotel' LIMIT 1), (SELECT id FROM users WHERE username = 'user2' LIMIT 1)),
(5, 'Hồ bơi vô cực tuyệt vời! View biển đẹp mê ly.', (SELECT id FROM hotel WHERE name = 'SALA Hotel' LIMIT 1), (SELECT id FROM users WHERE username = 'user1' LIMIT 1)),
(4, 'Khách sạn sang trọng, đầy đủ tiện nghi.', (SELECT id FROM hotel WHERE name = 'SALA Hotel' LIMIT 1), (SELECT id FROM users WHERE username = 'user2' LIMIT 1)),
(3, 'Giá rẻ, phù hợp cho ngân sách hạn chế.', (SELECT id FROM hotel WHERE name = 'Davue Hotel Da Nang' LIMIT 1), (SELECT id FROM users WHERE username = 'user1' LIMIT 1)),
(4, 'Vị trí trung tâm, tiện lợi đi lại.', (SELECT id FROM hotel WHERE name = 'Davue Hotel Da Nang' LIMIT 1), (SELECT id FROM users WHERE username = 'user2' LIMIT 1));

-- Xóa duplicate hotels TRƯỚC KHI INSERT (đảm bảo không có duplicate)
SET FOREIGN_KEY_CHECKS = 0;
DELETE h1 FROM hotel h1
INNER JOIN hotel h2 
ON h1.name = h2.name 
AND h1.owner_user = h2.owner_user
AND h1.deleted = h2.deleted
WHERE h1.id > h2.id;
SET FOREIGN_KEY_CHECKS = 1;

-- Thêm nhiều hotels hơn để test đầy đủ (Đà Nẵng) - sử dụng INSERT IGNORE
INSERT IGNORE INTO hotel (name, address, city, phone, description, image, rating, status, owner_user, deleted) VALUES
('Grand Mercure Danang', '666 Đường Võ Nguyên Giáp, Quận Sơn Trà', 'Đà Nẵng', '0236123466', 'Khách sạn 5 sao quốc tế với dịch vụ cao cấp', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 5, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1), FALSE),
('Novotel Danang', '777 Đường Bạch Đằng, Quận Hải Châu', 'Đà Nẵng', '0236123467', 'Khách sạn 4 sao hiện đại với view sông Hàn', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 4, 'success', (SELECT id FROM users WHERE username = 'owner2' LIMIT 1), FALSE),
('Pullman Danang Beach Resort', '888 Đường Võ Nguyên Giáp, Quận Sơn Trà', 'Đà Nẵng', '0236123468', 'Resort 5 sao ven biển với spa và golf', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', 5, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1), FALSE),
('Furama Resort Danang', '999 Đường Võ Nguyên Giáp, Quận Sơn Trà', 'Đà Nẵng', '0236123469', 'Resort 5 sao sang trọng với bãi biển riêng', 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', 5, 'success', (SELECT id FROM users WHERE username = 'owner2' LIMIT 1), FALSE),
('A La Carte Danang Beach', '111 Đường Võ Nguyên Giáp, Quận Sơn Trà', 'Đà Nẵng', '0236123470', 'Khách sạn 4 sao với hồ bơi vô cực và view biển', 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', 4, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1), FALSE),
('Brilliant Hotel', '222 Đường Trần Phú, Quận Hải Châu', 'Đà Nẵng', '0236123471', 'Khách sạn 3 sao gần trung tâm, giá cả hợp lý', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', 3, 'success', (SELECT id FROM users WHERE username = 'owner2' LIMIT 1), FALSE),
('Golden Bay Hotel', '333 Đường Lê Duẩn, Quận Hải Châu', 'Đà Nẵng', '0236123472', 'Khách sạn 4 sao với phòng view thành phố', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', 4, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1), FALSE),
('Seaside Hotel', '444 Đường Nguyễn Văn Linh, Quận Thanh Khê', 'Đà Nẵng', '0236123473', 'Khách sạn 3 sao gần biển, phù hợp cho gia đình', 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800', 3, 'success', (SELECT id FROM users WHERE username = 'owner2' LIMIT 1), FALSE),
('Ocean Villa Hotel', '555 Đường Hoàng Diệu, Quận Sơn Trà', 'Đà Nẵng', '0236123474', 'Khách sạn boutique 4 sao với phong cách độc đáo', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', 4, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1), FALSE),
('Sunny Beach Hotel', '666 Đường Phạm Văn Đồng, Quận Sơn Trà', 'Đà Nẵng', '0236123475', 'Khách sạn 3 sao giá rẻ, gần bãi biển', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', 3, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1), FALSE)
ON DUPLICATE KEY UPDATE name=VALUES(name), address=VALUES(address), city=VALUES(city), phone=VALUES(phone), description=VALUES(description), image=VALUES(image), rating=VALUES(rating), status=VALUES(status), deleted=FALSE;

-- Insert Hotel Images cho các hotels mới (Đà Nẵng - batch 2)
INSERT IGNORE INTO hotel_images (image_url, display_order, hotel_id, deleted) VALUES
-- Grand Mercure Danang - 5 ảnh
('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 0, (SELECT id FROM hotel WHERE name = 'Grand Mercure Danang' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 1, (SELECT id FROM hotel WHERE name = 'Grand Mercure Danang' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', 2, (SELECT id FROM hotel WHERE name = 'Grand Mercure Danang' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', 3, (SELECT id FROM hotel WHERE name = 'Grand Mercure Danang' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', 4, (SELECT id FROM hotel WHERE name = 'Grand Mercure Danang' LIMIT 1), FALSE),
-- Novotel Danang - 4 ảnh
('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 0, (SELECT id FROM hotel WHERE name = 'Novotel Danang' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 1, (SELECT id FROM hotel WHERE name = 'Novotel Danang' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', 2, (SELECT id FROM hotel WHERE name = 'Novotel Danang' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', 3, (SELECT id FROM hotel WHERE name = 'Novotel Danang' LIMIT 1), FALSE),
-- Pullman Danang Beach Resort - 5 ảnh
('https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', 0, (SELECT id FROM hotel WHERE name = 'Pullman Danang Beach Resort' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 1, (SELECT id FROM hotel WHERE name = 'Pullman Danang Beach Resort' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 2, (SELECT id FROM hotel WHERE name = 'Pullman Danang Beach Resort' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', 3, (SELECT id FROM hotel WHERE name = 'Pullman Danang Beach Resort' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', 4, (SELECT id FROM hotel WHERE name = 'Pullman Danang Beach Resort' LIMIT 1), FALSE),
-- Furama Resort Danang - 5 ảnh
('https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', 0, (SELECT id FROM hotel WHERE name = 'Furama Resort Danang' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 1, (SELECT id FROM hotel WHERE name = 'Furama Resort Danang' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 2, (SELECT id FROM hotel WHERE name = 'Furama Resort Danang' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', 3, (SELECT id FROM hotel WHERE name = 'Furama Resort Danang' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', 4, (SELECT id FROM hotel WHERE name = 'Furama Resort Danang' LIMIT 1), FALSE),
-- A La Carte Danang Beach - 4 ảnh
('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', 0, (SELECT id FROM hotel WHERE name = 'A La Carte Danang Beach' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 1, (SELECT id FROM hotel WHERE name = 'A La Carte Danang Beach' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 2, (SELECT id FROM hotel WHERE name = 'A La Carte Danang Beach' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', 3, (SELECT id FROM hotel WHERE name = 'A La Carte Danang Beach' LIMIT 1), FALSE),
-- Brilliant Hotel - 3 ảnh
('https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', 0, (SELECT id FROM hotel WHERE name = 'Brilliant Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800', 1, (SELECT id FROM hotel WHERE name = 'Brilliant Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', 2, (SELECT id FROM hotel WHERE name = 'Brilliant Hotel' LIMIT 1), FALSE),
-- Golden Bay Hotel - 4 ảnh
('https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', 0, (SELECT id FROM hotel WHERE name = 'Golden Bay Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800', 1, (SELECT id FROM hotel WHERE name = 'Golden Bay Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', 2, (SELECT id FROM hotel WHERE name = 'Golden Bay Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', 3, (SELECT id FROM hotel WHERE name = 'Golden Bay Hotel' LIMIT 1), FALSE),
-- Seaside Hotel - 3 ảnh
('https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800', 0, (SELECT id FROM hotel WHERE name = 'Seaside Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', 1, (SELECT id FROM hotel WHERE name = 'Seaside Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', 2, (SELECT id FROM hotel WHERE name = 'Seaside Hotel' LIMIT 1), FALSE),
-- Ocean Villa Hotel - 4 ảnh
('https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', 0, (SELECT id FROM hotel WHERE name = 'Ocean Villa Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800', 1, (SELECT id FROM hotel WHERE name = 'Ocean Villa Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', 2, (SELECT id FROM hotel WHERE name = 'Ocean Villa Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 3, (SELECT id FROM hotel WHERE name = 'Ocean Villa Hotel' LIMIT 1), FALSE),
-- Sunny Beach Hotel - 3 ảnh
('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', 0, (SELECT id FROM hotel WHERE name = 'Sunny Beach Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800', 1, (SELECT id FROM hotel WHERE name = 'Sunny Beach Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', 2, (SELECT id FROM hotel WHERE name = 'Sunny Beach Hotel' LIMIT 1), FALSE);

-- Xóa duplicate hotels TRƯỚC KHI INSERT (đảm bảo không có duplicate)
SET FOREIGN_KEY_CHECKS = 0;
DELETE h1 FROM hotel h1
INNER JOIN hotel h2 
ON h1.name = h2.name 
AND h1.owner_user = h2.owner_user
AND h1.deleted = h2.deleted
WHERE h1.id > h2.id;
SET FOREIGN_KEY_CHECKS = 1;

-- Thêm hotels ở các thành phố khác - sử dụng INSERT IGNORE
INSERT IGNORE INTO hotel (name, address, city, phone, description, image, rating, status, owner_user, deleted) VALUES
-- Hà Nội
('Hanoi Grand Hotel', '123 Phố Tràng Tiền, Hoàn Kiếm', 'Hà Nội', '0241234567', 'Khách sạn 5 sao ở trung tâm Hà Nội, gần Hồ Hoàn Kiếm', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 5, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1), FALSE),
('Sofitel Legend Metropole', '15 Phố Ngô Quyền, Hoàn Kiếm', 'Hà Nội', '0241234568', 'Khách sạn lịch sử 5 sao với kiến trúc Pháp cổ điển', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 5, 'success', (SELECT id FROM users WHERE username = 'owner2' LIMIT 1), FALSE),
('Hanoi Boutique Hotel', '456 Phố Lý Thường Kiệt, Hoàn Kiếm', 'Hà Nội', '0241234569', 'Khách sạn boutique 4 sao với phong cách hiện đại', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', 4, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1), FALSE),
-- Hồ Chí Minh
('Rex Hotel Saigon', '141 Nguyễn Huệ, Quận 1', 'Hồ Chí Minh', '0281234567', 'Khách sạn 4 sao lịch sử ở trung tâm Sài Gòn', 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', 4, 'success', (SELECT id FROM users WHERE username = 'owner2' LIMIT 1), FALSE),
('Park Hyatt Saigon', '2 Lam Sơn Square, Quận 1', 'Hồ Chí Minh', '0281234568', 'Khách sạn 5 sao sang trọng với view thành phố', 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', 5, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1), FALSE),
('Saigon Central Hotel', '789 Đường Lê Lợi, Quận 1', 'Hồ Chí Minh', '0281234569', 'Khách sạn 3 sao gần chợ Bến Thành', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', 3, 'success', (SELECT id FROM users WHERE username = 'owner2' LIMIT 1), FALSE),
-- Nha Trang
('Vinpearl Resort Nha Trang', 'Đảo Hòn Tre, Vịnh Nha Trang', 'Nha Trang', '0258123456', 'Resort 5 sao trên đảo với bãi biển riêng', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', 5, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1), FALSE),
('InterContinental Nha Trang', '32-34 Trần Phú, Nha Trang', 'Nha Trang', '0258123457', 'Khách sạn 5 sao ven biển với view đẹp', 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800', 5, 'success', (SELECT id FROM users WHERE username = 'owner2' LIMIT 1), FALSE),
('Nha Trang Beach Hotel', '123 Trần Phú, Nha Trang', 'Nha Trang', '0258123458', 'Khách sạn 4 sao gần bãi biển', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', 4, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1), FALSE),
-- Hội An
('Anantara Hoi An Resort', '1 Phạm Hồng Thái, Hội An', 'Hội An', '0235123456', 'Resort 5 sao bên sông với kiến trúc cổ', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', 5, 'success', (SELECT id FROM users WHERE username = 'owner2' LIMIT 1), FALSE),
('Hoi An Historic Hotel', '10 Trần Phú, Hội An', 'Hội An', '0235123457', 'Khách sạn 4 sao gần phố cổ Hội An', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 4, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1), FALSE),
-- Huế
('Imperial Hotel Hue', '8 Hùng Vương, Huế', 'Huế', '0234123456', 'Khách sạn 4 sao gần Hoàng thành Huế', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 4, 'success', (SELECT id FROM users WHERE username = 'owner2' LIMIT 1), FALSE),
('Pilgrimage Village Boutique', '130 Minh Mạng, Huế', 'Huế', '0234123457', 'Resort boutique 4 sao với không gian yên tĩnh', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', 4, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1), FALSE)
ON DUPLICATE KEY UPDATE name=VALUES(name), address=VALUES(address), city=VALUES(city), phone=VALUES(phone), description=VALUES(description), image=VALUES(image), rating=VALUES(rating), status=VALUES(status), deleted=FALSE;

-- Insert Hotel Images cho các hotels ở các thành phố khác
INSERT IGNORE INTO hotel_images (image_url, display_order, hotel_id, deleted) VALUES
-- Hanoi Grand Hotel - 5 ảnh
('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 0, (SELECT id FROM hotel WHERE name = 'Hanoi Grand Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 1, (SELECT id FROM hotel WHERE name = 'Hanoi Grand Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', 2, (SELECT id FROM hotel WHERE name = 'Hanoi Grand Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', 3, (SELECT id FROM hotel WHERE name = 'Hanoi Grand Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', 4, (SELECT id FROM hotel WHERE name = 'Hanoi Grand Hotel' LIMIT 1), FALSE),
-- Sofitel Legend Metropole - 5 ảnh
('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 0, (SELECT id FROM hotel WHERE name = 'Sofitel Legend Metropole' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 1, (SELECT id FROM hotel WHERE name = 'Sofitel Legend Metropole' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', 2, (SELECT id FROM hotel WHERE name = 'Sofitel Legend Metropole' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', 3, (SELECT id FROM hotel WHERE name = 'Sofitel Legend Metropole' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', 4, (SELECT id FROM hotel WHERE name = 'Sofitel Legend Metropole' LIMIT 1), FALSE),
-- Hanoi Boutique Hotel - 4 ảnh
('https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', 0, (SELECT id FROM hotel WHERE name = 'Hanoi Boutique Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 1, (SELECT id FROM hotel WHERE name = 'Hanoi Boutique Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 2, (SELECT id FROM hotel WHERE name = 'Hanoi Boutique Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', 3, (SELECT id FROM hotel WHERE name = 'Hanoi Boutique Hotel' LIMIT 1), FALSE),
-- Rex Hotel Saigon - 4 ảnh
('https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', 0, (SELECT id FROM hotel WHERE name = 'Rex Hotel Saigon' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 1, (SELECT id FROM hotel WHERE name = 'Rex Hotel Saigon' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 2, (SELECT id FROM hotel WHERE name = 'Rex Hotel Saigon' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', 3, (SELECT id FROM hotel WHERE name = 'Rex Hotel Saigon' LIMIT 1), FALSE),
-- Park Hyatt Saigon - 5 ảnh
('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', 0, (SELECT id FROM hotel WHERE name = 'Park Hyatt Saigon' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 1, (SELECT id FROM hotel WHERE name = 'Park Hyatt Saigon' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 2, (SELECT id FROM hotel WHERE name = 'Park Hyatt Saigon' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', 3, (SELECT id FROM hotel WHERE name = 'Park Hyatt Saigon' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', 4, (SELECT id FROM hotel WHERE name = 'Park Hyatt Saigon' LIMIT 1), FALSE),
-- Saigon Central Hotel - 3 ảnh
('https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', 0, (SELECT id FROM hotel WHERE name = 'Saigon Central Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800', 1, (SELECT id FROM hotel WHERE name = 'Saigon Central Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', 2, (SELECT id FROM hotel WHERE name = 'Saigon Central Hotel' LIMIT 1), FALSE),
-- Vinpearl Resort Nha Trang - 5 ảnh
('https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', 0, (SELECT id FROM hotel WHERE name = 'Vinpearl Resort Nha Trang' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 1, (SELECT id FROM hotel WHERE name = 'Vinpearl Resort Nha Trang' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 2, (SELECT id FROM hotel WHERE name = 'Vinpearl Resort Nha Trang' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', 3, (SELECT id FROM hotel WHERE name = 'Vinpearl Resort Nha Trang' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', 4, (SELECT id FROM hotel WHERE name = 'Vinpearl Resort Nha Trang' LIMIT 1), FALSE),
-- InterContinental Nha Trang - 5 ảnh
('https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800', 0, (SELECT id FROM hotel WHERE name = 'InterContinental Nha Trang' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', 1, (SELECT id FROM hotel WHERE name = 'InterContinental Nha Trang' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', 2, (SELECT id FROM hotel WHERE name = 'InterContinental Nha Trang' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 3, (SELECT id FROM hotel WHERE name = 'InterContinental Nha Trang' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 4, (SELECT id FROM hotel WHERE name = 'InterContinental Nha Trang' LIMIT 1), FALSE),
-- Nha Trang Beach Hotel - 4 ảnh
('https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', 0, (SELECT id FROM hotel WHERE name = 'Nha Trang Beach Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800', 1, (SELECT id FROM hotel WHERE name = 'Nha Trang Beach Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', 2, (SELECT id FROM hotel WHERE name = 'Nha Trang Beach Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 3, (SELECT id FROM hotel WHERE name = 'Nha Trang Beach Hotel' LIMIT 1), FALSE),
-- Anantara Hoi An Resort - 5 ảnh
('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', 0, (SELECT id FROM hotel WHERE name = 'Anantara Hoi An Resort' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 1, (SELECT id FROM hotel WHERE name = 'Anantara Hoi An Resort' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 2, (SELECT id FROM hotel WHERE name = 'Anantara Hoi An Resort' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', 3, (SELECT id FROM hotel WHERE name = 'Anantara Hoi An Resort' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', 4, (SELECT id FROM hotel WHERE name = 'Anantara Hoi An Resort' LIMIT 1), FALSE),
-- Hoi An Historic Hotel - 4 ảnh
('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 0, (SELECT id FROM hotel WHERE name = 'Hoi An Historic Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 1, (SELECT id FROM hotel WHERE name = 'Hoi An Historic Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', 2, (SELECT id FROM hotel WHERE name = 'Hoi An Historic Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', 3, (SELECT id FROM hotel WHERE name = 'Hoi An Historic Hotel' LIMIT 1), FALSE),
-- Imperial Hotel Hue - 4 ảnh
('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 0, (SELECT id FROM hotel WHERE name = 'Imperial Hotel Hue' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 1, (SELECT id FROM hotel WHERE name = 'Imperial Hotel Hue' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', 2, (SELECT id FROM hotel WHERE name = 'Imperial Hotel Hue' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', 3, (SELECT id FROM hotel WHERE name = 'Imperial Hotel Hue' LIMIT 1), FALSE),
-- Pilgrimage Village Boutique - 4 ảnh
('https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', 0, (SELECT id FROM hotel WHERE name = 'Pilgrimage Village Boutique' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 1, (SELECT id FROM hotel WHERE name = 'Pilgrimage Village Boutique' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 2, (SELECT id FROM hotel WHERE name = 'Pilgrimage Village Boutique' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', 3, (SELECT id FROM hotel WHERE name = 'Pilgrimage Village Boutique' LIMIT 1), FALSE);

-- Thêm rooms cho các hotels mới (đảm bảo mỗi hotel có ít nhất 3-5 rooms với giá đa dạng)
INSERT IGNORE INTO rooms (Number, type, status, price, capacity, image, discount_percent, hotel_id, deleted) VALUES
-- Rooms for Grand Mercure Danang
('1201', 'SUITE', 'AVAILABLE', 5000000, 4, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.2, (SELECT id FROM hotel WHERE name = 'Grand Mercure Danang' LIMIT 1), FALSE),
('1202', 'EXECUTIVE', 'AVAILABLE', 4500000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.15, (SELECT id FROM hotel WHERE name = 'Grand Mercure Danang' LIMIT 1), FALSE),
('1203', 'DELUXE', 'AVAILABLE', 4000000, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.1, (SELECT id FROM hotel WHERE name = 'Grand Mercure Danang' LIMIT 1), FALSE),
('1204', 'FAMILY', 'AVAILABLE', 5500000, 4, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.25, (SELECT id FROM hotel WHERE name = 'Grand Mercure Danang' LIMIT 1), FALSE),
('1205', 'STANDARD', 'AVAILABLE', 3500000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Grand Mercure Danang' LIMIT 1), FALSE),

-- Rooms for Novotel Danang
('1301', 'DELUXE', 'AVAILABLE', 2800000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.1, (SELECT id FROM hotel WHERE name = 'Novotel Danang' LIMIT 1), FALSE),
('1302', 'SUITE', 'AVAILABLE', 3500000, 4, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.15, (SELECT id FROM hotel WHERE name = 'Novotel Danang' LIMIT 1), FALSE),
('1303', 'EXECUTIVE', 'AVAILABLE', 3200000, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.12, (SELECT id FROM hotel WHERE name = 'Novotel Danang' LIMIT 1), FALSE),
('1304', 'STANDARD', 'AVAILABLE', 2400000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Novotel Danang' LIMIT 1), FALSE),
('1305', 'FAMILY', 'AVAILABLE', 3800000, 4, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.2, (SELECT id FROM hotel WHERE name = 'Novotel Danang' LIMIT 1), FALSE),

-- Rooms for Pullman Danang Beach Resort
('1401', 'SUITE', 'AVAILABLE', 6000000, 4, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.3, (SELECT id FROM hotel WHERE name = 'Pullman Danang Beach Resort' LIMIT 1), FALSE),
('1402', 'EXECUTIVE', 'AVAILABLE', 5500000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.25, (SELECT id FROM hotel WHERE name = 'Pullman Danang Beach Resort' LIMIT 1), FALSE),
('1403', 'DELUXE', 'AVAILABLE', 5000000, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.2, (SELECT id FROM hotel WHERE name = 'Pullman Danang Beach Resort' LIMIT 1), FALSE),
('1404', 'FAMILY', 'AVAILABLE', 6500000, 4, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.3, (SELECT id FROM hotel WHERE name = 'Pullman Danang Beach Resort' LIMIT 1), FALSE),
('1405', 'STANDARD', 'AVAILABLE', 4500000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.15, (SELECT id FROM hotel WHERE name = 'Pullman Danang Beach Resort' LIMIT 1), FALSE),

-- Rooms for Furama Resort Danang
('1501', 'SUITE', 'AVAILABLE', 7000000, 4, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.35, (SELECT id FROM hotel WHERE name = 'Furama Resort Danang' LIMIT 1), FALSE),
('1502', 'EXECUTIVE', 'AVAILABLE', 6500000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.3, (SELECT id FROM hotel WHERE name = 'Furama Resort Danang' LIMIT 1), FALSE),
('1503', 'DELUXE', 'AVAILABLE', 6000000, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.25, (SELECT id FROM hotel WHERE name = 'Furama Resort Danang' LIMIT 1), FALSE),
('1504', 'FAMILY', 'AVAILABLE', 7500000, 4, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.35, (SELECT id FROM hotel WHERE name = 'Furama Resort Danang' LIMIT 1), FALSE),
('1505', 'STANDARD', 'AVAILABLE', 5500000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.2, (SELECT id FROM hotel WHERE name = 'Furama Resort Danang' LIMIT 1), FALSE),

-- Rooms for A La Carte Danang Beach
('1601', 'DELUXE', 'AVAILABLE', 3200000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.15, (SELECT id FROM hotel WHERE name = 'A La Carte Danang Beach' LIMIT 1), FALSE),
('1602', 'SUITE', 'AVAILABLE', 4000000, 4, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.2, (SELECT id FROM hotel WHERE name = 'A La Carte Danang Beach' LIMIT 1), FALSE),
('1603', 'EXECUTIVE', 'AVAILABLE', 3600000, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.18, (SELECT id FROM hotel WHERE name = 'A La Carte Danang Beach' LIMIT 1), FALSE),
('1604', 'STANDARD', 'AVAILABLE', 2800000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.1, (SELECT id FROM hotel WHERE name = 'A La Carte Danang Beach' LIMIT 1), FALSE),
('1605', 'FAMILY', 'AVAILABLE', 4200000, 4, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.22, (SELECT id FROM hotel WHERE name = 'A La Carte Danang Beach' LIMIT 1), FALSE),

-- Rooms for Brilliant Hotel
('1701', 'STANDARD', 'AVAILABLE', 1200000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Brilliant Hotel' LIMIT 1), FALSE),
('1702', 'STANDARD', 'AVAILABLE', 1300000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.05, (SELECT id FROM hotel WHERE name = 'Brilliant Hotel' LIMIT 1), FALSE),
('1703', 'DELUXE', 'AVAILABLE', 1600000, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.1, (SELECT id FROM hotel WHERE name = 'Brilliant Hotel' LIMIT 1), FALSE),
('1704', 'FAMILY', 'AVAILABLE', 2000000, 4, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.12, (SELECT id FROM hotel WHERE name = 'Brilliant Hotel' LIMIT 1), FALSE),

-- Rooms for Golden Bay Hotel
('1801', 'DELUXE', 'AVAILABLE', 2400000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.12, (SELECT id FROM hotel WHERE name = 'Golden Bay Hotel' LIMIT 1), FALSE),
('1802', 'SUITE', 'AVAILABLE', 3000000, 4, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.15, (SELECT id FROM hotel WHERE name = 'Golden Bay Hotel' LIMIT 1), FALSE),
('1803', 'EXECUTIVE', 'AVAILABLE', 2700000, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.13, (SELECT id FROM hotel WHERE name = 'Golden Bay Hotel' LIMIT 1), FALSE),
('1804', 'STANDARD', 'AVAILABLE', 2000000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Golden Bay Hotel' LIMIT 1), FALSE),
('1805', 'FAMILY', 'AVAILABLE', 3200000, 4, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.18, (SELECT id FROM hotel WHERE name = 'Golden Bay Hotel' LIMIT 1), FALSE),

-- Rooms for Seaside Hotel
('1901', 'STANDARD', 'AVAILABLE', 1000000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Seaside Hotel' LIMIT 1), FALSE),
('1902', 'STANDARD', 'AVAILABLE', 1100000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.05, (SELECT id FROM hotel WHERE name = 'Seaside Hotel' LIMIT 1), FALSE),
('1903', 'DELUXE', 'AVAILABLE', 1400000, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.1, (SELECT id FROM hotel WHERE name = 'Seaside Hotel' LIMIT 1), FALSE),
('1904', 'FAMILY', 'AVAILABLE', 1800000, 4, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.12, (SELECT id FROM hotel WHERE name = 'Seaside Hotel' LIMIT 1), FALSE),

-- Rooms for Ocean Villa Hotel
('2001', 'DELUXE', 'AVAILABLE', 2600000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.14, (SELECT id FROM hotel WHERE name = 'Ocean Villa Hotel' LIMIT 1), FALSE),
('2002', 'SUITE', 'AVAILABLE', 3200000, 4, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.16, (SELECT id FROM hotel WHERE name = 'Ocean Villa Hotel' LIMIT 1), FALSE),
('2003', 'EXECUTIVE', 'AVAILABLE', 2900000, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.15, (SELECT id FROM hotel WHERE name = 'Ocean Villa Hotel' LIMIT 1), FALSE),
('2004', 'STANDARD', 'AVAILABLE', 2200000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.08, (SELECT id FROM hotel WHERE name = 'Ocean Villa Hotel' LIMIT 1), FALSE),
('2005', 'FAMILY', 'AVAILABLE', 3400000, 4, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.18, (SELECT id FROM hotel WHERE name = 'Ocean Villa Hotel' LIMIT 1), FALSE),

-- Rooms for Sunny Beach Hotel
('2101', 'STANDARD', 'AVAILABLE', 800000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Sunny Beach Hotel' LIMIT 1), FALSE),
('2102', 'STANDARD', 'AVAILABLE', 850000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Sunny Beach Hotel' LIMIT 1), FALSE),
('2103', 'DELUXE', 'AVAILABLE', 1200000, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.1, (SELECT id FROM hotel WHERE name = 'Sunny Beach Hotel' LIMIT 1), FALSE),
('2104', 'FAMILY', 'AVAILABLE', 1500000, 4, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.12, (SELECT id FROM hotel WHERE name = 'Sunny Beach Hotel' LIMIT 1), FALSE),

-- Rooms for hotels ở các thành phố khác
-- Hanoi Grand Hotel
('2201', 'SUITE', 'AVAILABLE', 4500000, 4, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.15, (SELECT id FROM hotel WHERE name = 'Hanoi Grand Hotel' LIMIT 1), FALSE),
('2202', 'DELUXE', 'AVAILABLE', 3500000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.1, (SELECT id FROM hotel WHERE name = 'Hanoi Grand Hotel' LIMIT 1), FALSE),
('2203', 'EXECUTIVE', 'AVAILABLE', 4000000, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.12, (SELECT id FROM hotel WHERE name = 'Hanoi Grand Hotel' LIMIT 1), FALSE),
-- Sofitel Legend Metropole
('2301', 'SUITE', 'AVAILABLE', 5000000, 4, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.2, (SELECT id FROM hotel WHERE name = 'Sofitel Legend Metropole' LIMIT 1), FALSE),
('2302', 'DELUXE', 'AVAILABLE', 4000000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.15, (SELECT id FROM hotel WHERE name = 'Sofitel Legend Metropole' LIMIT 1), FALSE),
-- Rex Hotel Saigon
('2401', 'DELUXE', 'AVAILABLE', 3200000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.1, (SELECT id FROM hotel WHERE name = 'Rex Hotel Saigon' LIMIT 1), FALSE),
('2402', 'SUITE', 'AVAILABLE', 4000000, 4, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.15, (SELECT id FROM hotel WHERE name = 'Rex Hotel Saigon' LIMIT 1), FALSE),
('2403', 'STANDARD', 'AVAILABLE', 2500000, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Rex Hotel Saigon' LIMIT 1), FALSE),
-- Park Hyatt Saigon
('2501', 'SUITE', 'AVAILABLE', 6000000, 4, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.25, (SELECT id FROM hotel WHERE name = 'Park Hyatt Saigon' LIMIT 1), FALSE),
('2502', 'EXECUTIVE', 'AVAILABLE', 5500000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.2, (SELECT id FROM hotel WHERE name = 'Park Hyatt Saigon' LIMIT 1), FALSE),
('2503', 'DELUXE', 'AVAILABLE', 5000000, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.18, (SELECT id FROM hotel WHERE name = 'Park Hyatt Saigon' LIMIT 1), FALSE),
-- Vinpearl Resort Nha Trang
('2601', 'SUITE', 'AVAILABLE', 5500000, 4, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.3, (SELECT id FROM hotel WHERE name = 'Vinpearl Resort Nha Trang' LIMIT 1), FALSE),
('2602', 'DELUXE', 'AVAILABLE', 4500000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.25, (SELECT id FROM hotel WHERE name = 'Vinpearl Resort Nha Trang' LIMIT 1), FALSE),
('2603', 'FAMILY', 'AVAILABLE', 6000000, 4, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.3, (SELECT id FROM hotel WHERE name = 'Vinpearl Resort Nha Trang' LIMIT 1), FALSE),
-- InterContinental Nha Trang
('2701', 'SUITE', 'AVAILABLE', 5000000, 4, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.2, (SELECT id FROM hotel WHERE name = 'InterContinental Nha Trang' LIMIT 1), FALSE),
('2702', 'DELUXE', 'AVAILABLE', 4000000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.15, (SELECT id FROM hotel WHERE name = 'InterContinental Nha Trang' LIMIT 1), FALSE),
-- Anantara Hoi An Resort
('2801', 'SUITE', 'AVAILABLE', 4800000, 4, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.22, (SELECT id FROM hotel WHERE name = 'Anantara Hoi An Resort' LIMIT 1), FALSE),
('2802', 'DELUXE', 'AVAILABLE', 3800000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.18, (SELECT id FROM hotel WHERE name = 'Anantara Hoi An Resort' LIMIT 1), FALSE),
('2803', 'FAMILY', 'AVAILABLE', 5200000, 4, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.25, (SELECT id FROM hotel WHERE name = 'Anantara Hoi An Resort' LIMIT 1), FALSE),
-- Imperial Hotel Hue
('2901', 'DELUXE', 'AVAILABLE', 3000000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.12, (SELECT id FROM hotel WHERE name = 'Imperial Hotel Hue' LIMIT 1), FALSE),
('2902', 'SUITE', 'AVAILABLE', 3800000, 4, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.15, (SELECT id FROM hotel WHERE name = 'Imperial Hotel Hue' LIMIT 1), FALSE),
('2903', 'STANDARD', 'AVAILABLE', 2500000, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Imperial Hotel Hue' LIMIT 1), FALSE),
-- Hanoi Boutique Hotel (thêm rooms)
('3104', 'DELUXE', 'AVAILABLE', 2200000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.1, (SELECT id FROM hotel WHERE name = 'Hanoi Boutique Hotel' LIMIT 1), FALSE),
('3105', 'STANDARD', 'AVAILABLE', 1800000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Hanoi Boutique Hotel' LIMIT 1), FALSE),
-- Hoi An Historic Hotel (thêm rooms)
('2804', 'DELUXE', 'AVAILABLE', 3200000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.12, (SELECT id FROM hotel WHERE name = 'Hoi An Historic Hotel' LIMIT 1), FALSE),
('2805', 'STANDARD', 'AVAILABLE', 2600000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Hoi An Historic Hotel' LIMIT 1), FALSE),
-- Nha Trang Beach Hotel (thêm rooms)
('2703', 'DELUXE', 'AVAILABLE', 3500000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.15, (SELECT id FROM hotel WHERE name = 'Nha Trang Beach Hotel' LIMIT 1), FALSE),
('2704', 'STANDARD', 'AVAILABLE', 2800000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Nha Trang Beach Hotel' LIMIT 1), FALSE),
-- Saigon Central Hotel (thêm rooms)
('2404', 'STANDARD', 'AVAILABLE', 2000000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Saigon Central Hotel' LIMIT 1), FALSE),
('2405', 'DELUXE', 'AVAILABLE', 2400000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.1, (SELECT id FROM hotel WHERE name = 'Saigon Central Hotel' LIMIT 1), FALSE),
-- Pilgrimage Village Boutique (thêm rooms)
('2904', 'DELUXE', 'AVAILABLE', 3200000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.14, (SELECT id FROM hotel WHERE name = 'Pilgrimage Village Boutique' LIMIT 1), FALSE),
('2905', 'STANDARD', 'AVAILABLE', 2600000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Pilgrimage Village Boutique' LIMIT 1), FALSE);

-- Xóa duplicate hotels TRƯỚC KHI INSERT (đảm bảo không có duplicate)
SET FOREIGN_KEY_CHECKS = 0;
DELETE h1 FROM hotel h1
INNER JOIN hotel h2 
ON h1.name = h2.name 
AND h1.owner_user = h2.owner_user
AND h1.deleted = h2.deleted
WHERE h1.id > h2.id;
SET FOREIGN_KEY_CHECKS = 1;

-- Thêm nhiều hotels hơn ở các thành phố khác để test đầy đủ - sử dụng INSERT IGNORE
INSERT IGNORE INTO hotel (name, address, city, phone, description, image, rating, status, owner_user, deleted) VALUES
-- Hà Nội - thêm hotels
('Hanoi Opera Hotel', '29 Tràng Tiền, Hoàn Kiếm', 'Hà Nội', '0241234570', 'Khách sạn 4 sao gần Nhà hát Lớn', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 4, 'success', (SELECT id FROM users WHERE username = 'owner2' LIMIT 1), FALSE),
('Hanoi Garden Hotel', '78 Phố Hàng Bông, Hoàn Kiếm', 'Hà Nội', '0241234571', 'Khách sạn 3 sao gần phố cổ', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', 3, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1), FALSE),
('Hanoi Capital Hotel', '12 Lý Thái Tổ, Hoàn Kiếm', 'Hà Nội', '0241234572', 'Khách sạn 4 sao view Hồ Gươm', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 4, 'success', (SELECT id FROM users WHERE username = 'owner2' LIMIT 1), FALSE),
-- Hồ Chí Minh - thêm hotels
('Caravelle Saigon', '19 Công Trường Lam Sơn, Quận 1', 'Hồ Chí Minh', '0281234570', 'Khách sạn 5 sao lịch sử ở trung tâm', 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', 5, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1), FALSE),
('Majestic Saigon Hotel', '1 Đồng Khởi, Quận 1', 'Hồ Chí Minh', '0281234571', 'Khách sạn 4 sao ven sông Sài Gòn', 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', 4, 'success', (SELECT id FROM users WHERE username = 'owner2' LIMIT 1), FALSE),
('Liberty Central Saigon', '265 Phạm Ngũ Lão, Quận 1', 'Hồ Chí Minh', '0281234572', 'Khách sạn 3 sao gần phố Tây Bùi Viện', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', 3, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1), FALSE),
('Sheraton Saigon', '88 Đồng Khởi, Quận 1', 'Hồ Chí Minh', '0281234573', 'Khách sạn 5 sao sang trọng', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', 5, 'success', (SELECT id FROM users WHERE username = 'owner2' LIMIT 1), FALSE),
-- Nha Trang - thêm hotels
('Sheraton Nha Trang', '26-28 Trần Phú, Nha Trang', 'Nha Trang', '0258123459', 'Khách sạn 5 sao ven biển', 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800', 5, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1), FALSE),
('Amanoi Resort', 'Vịnh Vĩnh Hy, Nha Trang', 'Nha Trang', '0258123460', 'Resort 5 sao cao cấp với spa', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', 5, 'success', (SELECT id FROM users WHERE username = 'owner2' LIMIT 1), FALSE),
('Mia Resort Nha Trang', 'Bãi Dài, Cam Ranh', 'Nha Trang', '0258123461', 'Resort 4 sao với bãi biển riêng', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', 4, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1), FALSE),
-- Hội An - thêm hotels
('Four Seasons Resort Hoi An', 'Bãi Bắc, Cửa Đại', 'Hội An', '0235123458', 'Resort 5 sao sang trọng ven biển', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 5, 'success', (SELECT id FROM users WHERE username = 'owner2' LIMIT 1), FALSE),
('Palm Garden Beach Resort', 'Lạc Long Quân, Cửa Đại', 'Hội An', '0235123459', 'Resort 4 sao với hồ bơi lớn', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 4, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1), FALSE),
('Hoi An Riverside Resort', 'Cẩm Nam, Hội An', 'Hội An', '0235123460', 'Resort 4 sao bên sông Thu Bồn', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', 4, 'success', (SELECT id FROM users WHERE username = 'owner2' LIMIT 1), FALSE),
-- Huế - thêm hotels
('La Residence Hue', '5 Lê Lợi, Huế', 'Huế', '0234123458', 'Khách sạn 4 sao với kiến trúc Art Deco', 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', 4, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1), FALSE),
('Azerai La Residence', '5 Lê Lợi, Huế', 'Huế', '0234123459', 'Khách sạn boutique 4 sao ven sông Hương', 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', 4, 'success', (SELECT id FROM users WHERE username = 'owner2' LIMIT 1), FALSE),
('Moonlight Hotel Hue', '20 Phạm Ngũ Lão, Huế', 'Huế', '0234123460', 'Khách sạn 3 sao gần trung tâm', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', 3, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1), FALSE)
ON DUPLICATE KEY UPDATE name=VALUES(name), address=VALUES(address), city=VALUES(city), phone=VALUES(phone), description=VALUES(description), image=VALUES(image), rating=VALUES(rating), status=VALUES(status), deleted=FALSE;

-- Insert Hotel Images cho các hotels mới (batch cuối)
INSERT IGNORE INTO hotel_images (image_url, display_order, hotel_id, deleted) VALUES
-- Hanoi Opera Hotel - 4 ảnh
('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 0, (SELECT id FROM hotel WHERE name = 'Hanoi Opera Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 1, (SELECT id FROM hotel WHERE name = 'Hanoi Opera Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', 2, (SELECT id FROM hotel WHERE name = 'Hanoi Opera Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', 3, (SELECT id FROM hotel WHERE name = 'Hanoi Opera Hotel' LIMIT 1), FALSE),
-- Hanoi Garden Hotel - 3 ảnh
('https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', 0, (SELECT id FROM hotel WHERE name = 'Hanoi Garden Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800', 1, (SELECT id FROM hotel WHERE name = 'Hanoi Garden Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', 2, (SELECT id FROM hotel WHERE name = 'Hanoi Garden Hotel' LIMIT 1), FALSE),
-- Hanoi Capital Hotel - 4 ảnh
('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 0, (SELECT id FROM hotel WHERE name = 'Hanoi Capital Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 1, (SELECT id FROM hotel WHERE name = 'Hanoi Capital Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', 2, (SELECT id FROM hotel WHERE name = 'Hanoi Capital Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', 3, (SELECT id FROM hotel WHERE name = 'Hanoi Capital Hotel' LIMIT 1), FALSE),
-- Caravelle Saigon - 5 ảnh
('https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', 0, (SELECT id FROM hotel WHERE name = 'Caravelle Saigon' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 1, (SELECT id FROM hotel WHERE name = 'Caravelle Saigon' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 2, (SELECT id FROM hotel WHERE name = 'Caravelle Saigon' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', 3, (SELECT id FROM hotel WHERE name = 'Caravelle Saigon' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', 4, (SELECT id FROM hotel WHERE name = 'Caravelle Saigon' LIMIT 1), FALSE),
-- Majestic Saigon Hotel - 4 ảnh
('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', 0, (SELECT id FROM hotel WHERE name = 'Majestic Saigon Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 1, (SELECT id FROM hotel WHERE name = 'Majestic Saigon Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 2, (SELECT id FROM hotel WHERE name = 'Majestic Saigon Hotel' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', 3, (SELECT id FROM hotel WHERE name = 'Majestic Saigon Hotel' LIMIT 1), FALSE),
-- Liberty Central Saigon - 3 ảnh
('https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', 0, (SELECT id FROM hotel WHERE name = 'Liberty Central Saigon' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800', 1, (SELECT id FROM hotel WHERE name = 'Liberty Central Saigon' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', 2, (SELECT id FROM hotel WHERE name = 'Liberty Central Saigon' LIMIT 1), FALSE),
-- Sheraton Saigon - 5 ảnh
('https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', 0, (SELECT id FROM hotel WHERE name = 'Sheraton Saigon' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 1, (SELECT id FROM hotel WHERE name = 'Sheraton Saigon' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 2, (SELECT id FROM hotel WHERE name = 'Sheraton Saigon' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', 3, (SELECT id FROM hotel WHERE name = 'Sheraton Saigon' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', 4, (SELECT id FROM hotel WHERE name = 'Sheraton Saigon' LIMIT 1), FALSE),
-- Sheraton Nha Trang - 5 ảnh
('https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800', 0, (SELECT id FROM hotel WHERE name = 'Sheraton Nha Trang' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', 1, (SELECT id FROM hotel WHERE name = 'Sheraton Nha Trang' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', 2, (SELECT id FROM hotel WHERE name = 'Sheraton Nha Trang' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 3, (SELECT id FROM hotel WHERE name = 'Sheraton Nha Trang' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 4, (SELECT id FROM hotel WHERE name = 'Sheraton Nha Trang' LIMIT 1), FALSE),
-- Amanoi Resort - 5 ảnh
('https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', 0, (SELECT id FROM hotel WHERE name = 'Amanoi Resort' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800', 1, (SELECT id FROM hotel WHERE name = 'Amanoi Resort' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', 2, (SELECT id FROM hotel WHERE name = 'Amanoi Resort' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 3, (SELECT id FROM hotel WHERE name = 'Amanoi Resort' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 4, (SELECT id FROM hotel WHERE name = 'Amanoi Resort' LIMIT 1), FALSE),
-- Mia Resort Nha Trang - 4 ảnh
('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', 0, (SELECT id FROM hotel WHERE name = 'Mia Resort Nha Trang' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800', 1, (SELECT id FROM hotel WHERE name = 'Mia Resort Nha Trang' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', 2, (SELECT id FROM hotel WHERE name = 'Mia Resort Nha Trang' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 3, (SELECT id FROM hotel WHERE name = 'Mia Resort Nha Trang' LIMIT 1), FALSE),
-- Four Seasons Resort Hoi An - 5 ảnh
('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 0, (SELECT id FROM hotel WHERE name = 'Four Seasons Resort Hoi An' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 1, (SELECT id FROM hotel WHERE name = 'Four Seasons Resort Hoi An' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', 2, (SELECT id FROM hotel WHERE name = 'Four Seasons Resort Hoi An' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', 3, (SELECT id FROM hotel WHERE name = 'Four Seasons Resort Hoi An' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', 4, (SELECT id FROM hotel WHERE name = 'Four Seasons Resort Hoi An' LIMIT 1), FALSE),
-- Palm Garden Beach Resort - 4 ảnh
('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 0, (SELECT id FROM hotel WHERE name = 'Palm Garden Beach Resort' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 1, (SELECT id FROM hotel WHERE name = 'Palm Garden Beach Resort' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', 2, (SELECT id FROM hotel WHERE name = 'Palm Garden Beach Resort' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', 3, (SELECT id FROM hotel WHERE name = 'Palm Garden Beach Resort' LIMIT 1), FALSE),
-- Hoi An Riverside Resort - 4 ảnh
('https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', 0, (SELECT id FROM hotel WHERE name = 'Hoi An Riverside Resort' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 1, (SELECT id FROM hotel WHERE name = 'Hoi An Riverside Resort' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 2, (SELECT id FROM hotel WHERE name = 'Hoi An Riverside Resort' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', 3, (SELECT id FROM hotel WHERE name = 'Hoi An Riverside Resort' LIMIT 1), FALSE),
-- La Residence Hue - 4 ảnh
('https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', 0, (SELECT id FROM hotel WHERE name = 'La Residence Hue' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 1, (SELECT id FROM hotel WHERE name = 'La Residence Hue' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 2, (SELECT id FROM hotel WHERE name = 'La Residence Hue' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', 3, (SELECT id FROM hotel WHERE name = 'La Residence Hue' LIMIT 1), FALSE),
-- Azerai La Residence - 4 ảnh
('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', 0, (SELECT id FROM hotel WHERE name = 'Azerai La Residence' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 1, (SELECT id FROM hotel WHERE name = 'Azerai La Residence' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 2, (SELECT id FROM hotel WHERE name = 'Azerai La Residence' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', 3, (SELECT id FROM hotel WHERE name = 'Azerai La Residence' LIMIT 1), FALSE),
-- Moonlight Hotel Hue - 3 ảnh
('https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', 0, (SELECT id FROM hotel WHERE name = 'Moonlight Hotel Hue' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800', 1, (SELECT id FROM hotel WHERE name = 'Moonlight Hotel Hue' LIMIT 1), FALSE),
('https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', 2, (SELECT id FROM hotel WHERE name = 'Moonlight Hotel Hue' LIMIT 1), FALSE);

-- Thêm rooms cho các hotels mới
INSERT INTO rooms (Number, type, status, price, capacity, image, discount_percent, hotel_id, deleted) VALUES
-- Hanoi Opera Hotel
('3001', 'DELUXE', 'AVAILABLE', 3200000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.1, (SELECT id FROM hotel WHERE name = 'Hanoi Opera Hotel' LIMIT 1), FALSE),
('3002', 'SUITE', 'AVAILABLE', 4200000, 4, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.15, (SELECT id FROM hotel WHERE name = 'Hanoi Opera Hotel' LIMIT 1), FALSE),
('3003', 'STANDARD', 'AVAILABLE', 2800000, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Hanoi Opera Hotel' LIMIT 1), FALSE),
-- Hanoi Garden Hotel
('3101', 'STANDARD', 'AVAILABLE', 1500000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Hanoi Garden Hotel' LIMIT 1), FALSE),
('3102', 'DELUXE', 'AVAILABLE', 2000000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.1, (SELECT id FROM hotel WHERE name = 'Hanoi Garden Hotel' LIMIT 1), FALSE),
('3103', 'FAMILY', 'AVAILABLE', 2500000, 4, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.12, (SELECT id FROM hotel WHERE name = 'Hanoi Garden Hotel' LIMIT 1), FALSE),
-- Hanoi Capital Hotel
('3201', 'DELUXE', 'AVAILABLE', 3000000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.12, (SELECT id FROM hotel WHERE name = 'Hanoi Capital Hotel' LIMIT 1), FALSE),
('3202', 'EXECUTIVE', 'AVAILABLE', 3800000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.15, (SELECT id FROM hotel WHERE name = 'Hanoi Capital Hotel' LIMIT 1), FALSE),
('3203', 'SUITE', 'AVAILABLE', 4500000, 4, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.18, (SELECT id FROM hotel WHERE name = 'Hanoi Capital Hotel' LIMIT 1), FALSE),
-- Caravelle Saigon
('3301', 'SUITE', 'AVAILABLE', 5500000, 4, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.2, (SELECT id FROM hotel WHERE name = 'Caravelle Saigon' LIMIT 1), FALSE),
('3302', 'EXECUTIVE', 'AVAILABLE', 5000000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.18, (SELECT id FROM hotel WHERE name = 'Caravelle Saigon' LIMIT 1), FALSE),
('3303', 'DELUXE', 'AVAILABLE', 4500000, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.15, (SELECT id FROM hotel WHERE name = 'Caravelle Saigon' LIMIT 1), FALSE),
-- Majestic Saigon Hotel
('3401', 'DELUXE', 'AVAILABLE', 3500000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.12, (SELECT id FROM hotel WHERE name = 'Majestic Saigon Hotel' LIMIT 1), FALSE),
('3402', 'SUITE', 'AVAILABLE', 4500000, 4, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.18, (SELECT id FROM hotel WHERE name = 'Majestic Saigon Hotel' LIMIT 1), FALSE),
('3403', 'STANDARD', 'AVAILABLE', 3000000, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Majestic Saigon Hotel' LIMIT 1), FALSE),
-- Liberty Central Saigon
('3501', 'STANDARD', 'AVAILABLE', 1800000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Liberty Central Saigon' LIMIT 1), FALSE),
('3502', 'DELUXE', 'AVAILABLE', 2200000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.1, (SELECT id FROM hotel WHERE name = 'Liberty Central Saigon' LIMIT 1), FALSE),
('3503', 'FAMILY', 'AVAILABLE', 2800000, 4, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.12, (SELECT id FROM hotel WHERE name = 'Liberty Central Saigon' LIMIT 1), FALSE),
-- Sheraton Saigon
('3601', 'SUITE', 'AVAILABLE', 6500000, 4, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.25, (SELECT id FROM hotel WHERE name = 'Sheraton Saigon' LIMIT 1), FALSE),
('3602', 'EXECUTIVE', 'AVAILABLE', 6000000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.22, (SELECT id FROM hotel WHERE name = 'Sheraton Saigon' LIMIT 1), FALSE),
('3603', 'DELUXE', 'AVAILABLE', 5500000, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.2, (SELECT id FROM hotel WHERE name = 'Sheraton Saigon' LIMIT 1), FALSE),
-- Sheraton Nha Trang
('3701', 'SUITE', 'AVAILABLE', 5200000, 4, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.22, (SELECT id FROM hotel WHERE name = 'Sheraton Nha Trang' LIMIT 1), FALSE),
('3702', 'DELUXE', 'AVAILABLE', 4200000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.18, (SELECT id FROM hotel WHERE name = 'Sheraton Nha Trang' LIMIT 1), FALSE),
('3703', 'FAMILY', 'AVAILABLE', 5800000, 4, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.25, (SELECT id FROM hotel WHERE name = 'Sheraton Nha Trang' LIMIT 1), FALSE),
-- Amanoi Resort
('3801', 'SUITE', 'AVAILABLE', 8000000, 4, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.3, (SELECT id FROM hotel WHERE name = 'Amanoi Resort' LIMIT 1), FALSE),
('3802', 'EXECUTIVE', 'AVAILABLE', 7500000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.28, (SELECT id FROM hotel WHERE name = 'Amanoi Resort' LIMIT 1), FALSE),
('3803', 'DELUXE', 'AVAILABLE', 7000000, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.25, (SELECT id FROM hotel WHERE name = 'Amanoi Resort' LIMIT 1), FALSE),
-- Mia Resort Nha Trang
('3901', 'SUITE', 'AVAILABLE', 4800000, 4, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.2, (SELECT id FROM hotel WHERE name = 'Mia Resort Nha Trang' LIMIT 1), FALSE),
('3902', 'DELUXE', 'AVAILABLE', 3800000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.15, (SELECT id FROM hotel WHERE name = 'Mia Resort Nha Trang' LIMIT 1), FALSE),
('3903', 'FAMILY', 'AVAILABLE', 5200000, 4, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.22, (SELECT id FROM hotel WHERE name = 'Mia Resort Nha Trang' LIMIT 1), FALSE),
-- Four Seasons Resort Hoi An
('4001', 'SUITE', 'AVAILABLE', 7500000, 4, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.3, (SELECT id FROM hotel WHERE name = 'Four Seasons Resort Hoi An' LIMIT 1), FALSE),
('4002', 'EXECUTIVE', 'AVAILABLE', 7000000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.28, (SELECT id FROM hotel WHERE name = 'Four Seasons Resort Hoi An' LIMIT 1), FALSE),
('4003', 'DELUXE', 'AVAILABLE', 6500000, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.25, (SELECT id FROM hotel WHERE name = 'Four Seasons Resort Hoi An' LIMIT 1), FALSE),
-- Palm Garden Beach Resort
('4101', 'SUITE', 'AVAILABLE', 4500000, 4, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.18, (SELECT id FROM hotel WHERE name = 'Palm Garden Beach Resort' LIMIT 1), FALSE),
('4102', 'DELUXE', 'AVAILABLE', 3500000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.15, (SELECT id FROM hotel WHERE name = 'Palm Garden Beach Resort' LIMIT 1), FALSE),
('4103', 'FAMILY', 'AVAILABLE', 4800000, 4, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.2, (SELECT id FROM hotel WHERE name = 'Palm Garden Beach Resort' LIMIT 1), FALSE),
-- Hoi An Riverside Resort
('4201', 'DELUXE', 'AVAILABLE', 4000000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.16, (SELECT id FROM hotel WHERE name = 'Hoi An Riverside Resort' LIMIT 1), FALSE),
('4202', 'SUITE', 'AVAILABLE', 5000000, 4, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.2, (SELECT id FROM hotel WHERE name = 'Hoi An Riverside Resort' LIMIT 1), FALSE),
('4203', 'STANDARD', 'AVAILABLE', 3200000, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Hoi An Riverside Resort' LIMIT 1), FALSE),
-- La Residence Hue
('4301', 'DELUXE', 'AVAILABLE', 3500000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.14, (SELECT id FROM hotel WHERE name = 'La Residence Hue' LIMIT 1), FALSE),
('4302', 'SUITE', 'AVAILABLE', 4500000, 4, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.18, (SELECT id FROM hotel WHERE name = 'La Residence Hue' LIMIT 1), FALSE),
('4303', 'EXECUTIVE', 'AVAILABLE', 4000000, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.16, (SELECT id FROM hotel WHERE name = 'La Residence Hue' LIMIT 1), FALSE),
-- Azerai La Residence
('4401', 'SUITE', 'AVAILABLE', 4800000, 4, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.2, (SELECT id FROM hotel WHERE name = 'Azerai La Residence' LIMIT 1), FALSE),
('4402', 'DELUXE', 'AVAILABLE', 3800000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.16, (SELECT id FROM hotel WHERE name = 'Azerai La Residence' LIMIT 1), FALSE),
('4403', 'STANDARD', 'AVAILABLE', 3000000, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Azerai La Residence' LIMIT 1), FALSE),
-- Moonlight Hotel Hue
('4501', 'STANDARD', 'AVAILABLE', 1800000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Moonlight Hotel Hue' LIMIT 1), FALSE),
('4502', 'DELUXE', 'AVAILABLE', 2200000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.1, (SELECT id FROM hotel WHERE name = 'Moonlight Hotel Hue' LIMIT 1), FALSE),
('4503', 'FAMILY', 'AVAILABLE', 2800000, 4, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.12, (SELECT id FROM hotel WHERE name = 'Moonlight Hotel Hue' LIMIT 1), FALSE);

-- Thêm bookings với các ngày khác nhau để test availability
INSERT IGNORE INTO booking (status, booking_date, check_in_date, check_out_date, total_price, user_id, hotel_id, rooms_id) VALUES
-- Bookings trong tương lai để test filter
('PAID', NOW(), DATE_ADD(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 8 DAY), 4500000, (SELECT id FROM users WHERE username = 'user1' LIMIT 1), (SELECT id FROM hotel WHERE name = 'Mường Thanh Hotel' LIMIT 1), (SELECT id FROM rooms WHERE Number = '101' AND hotel_id = (SELECT id FROM hotel WHERE name = 'Mường Thanh Hotel' LIMIT 1) LIMIT 1)),
('PAID', NOW(), DATE_ADD(NOW(), INTERVAL 10 DAY), DATE_ADD(NOW(), INTERVAL 13 DAY), 6000000, (SELECT id FROM users WHERE username = 'user2' LIMIT 1), (SELECT id FROM hotel WHERE name = 'Century Hotel' LIMIT 1), (SELECT id FROM rooms WHERE Number = '201' AND hotel_id = (SELECT id FROM hotel WHERE name = 'Century Hotel' LIMIT 1) LIMIT 1)),
('PENDING', NOW(), DATE_ADD(NOW(), INTERVAL 15 DAY), DATE_ADD(NOW(), INTERVAL 18 DAY), 3600000, (SELECT id FROM users WHERE username = 'user1' LIMIT 1), (SELECT id FROM hotel WHERE name = 'Hanoi Grand Hotel' LIMIT 1), (SELECT id FROM rooms WHERE Number = '2201' AND hotel_id = (SELECT id FROM hotel WHERE name = 'Hanoi Grand Hotel' LIMIT 1) LIMIT 1)),
('PAID', NOW(), DATE_ADD(NOW(), INTERVAL 20 DAY), DATE_ADD(NOW(), INTERVAL 23 DAY), 5000000, (SELECT id FROM users WHERE username = 'user2' LIMIT 1), (SELECT id FROM hotel WHERE name = 'Park Hyatt Saigon' LIMIT 1), (SELECT id FROM rooms WHERE Number = '2501' AND hotel_id = (SELECT id FROM hotel WHERE name = 'Park Hyatt Saigon' LIMIT 1) LIMIT 1)),
('PAID', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 10 DAY), 4200000, (SELECT id FROM users WHERE username = 'user1' LIMIT 1), (SELECT id FROM hotel WHERE name = 'Vinpearl Resort Nha Trang' LIMIT 1), (SELECT id FROM rooms WHERE Number = '2601' AND hotel_id = (SELECT id FROM hotel WHERE name = 'Vinpearl Resort Nha Trang' LIMIT 1) LIMIT 1)),
('PENDING', NOW(), DATE_ADD(NOW(), INTERVAL 12 DAY), DATE_ADD(NOW(), INTERVAL 15 DAY), 3800000, (SELECT id FROM users WHERE username = 'user2' LIMIT 1), (SELECT id FROM hotel WHERE name = 'Anantara Hoi An Resort' LIMIT 1), (SELECT id FROM rooms WHERE Number = '2801' AND hotel_id = (SELECT id FROM hotel WHERE name = 'Anantara Hoi An Resort' LIMIT 1) LIMIT 1)),
('PAID', NOW(), DATE_ADD(NOW(), INTERVAL 25 DAY), DATE_ADD(NOW(), INTERVAL 28 DAY), 3200000, (SELECT id FROM users WHERE username = 'user1' LIMIT 1), (SELECT id FROM hotel WHERE name = 'Imperial Hotel Hue' LIMIT 1), (SELECT id FROM rooms WHERE Number = '2901' AND hotel_id = (SELECT id FROM hotel WHERE name = 'Imperial Hotel Hue' LIMIT 1) LIMIT 1)),
-- Bookings ở các hotels mới
('PAID', NOW(), DATE_ADD(NOW(), INTERVAL 6 DAY), DATE_ADD(NOW(), INTERVAL 9 DAY), 4800000, (SELECT id FROM users WHERE username = 'user2' LIMIT 1), (SELECT id FROM hotel WHERE name = 'Hanoi Opera Hotel' LIMIT 1), (SELECT id FROM rooms WHERE Number = '3001' AND hotel_id = (SELECT id FROM hotel WHERE name = 'Hanoi Opera Hotel' LIMIT 1) LIMIT 1)),
('PENDING', NOW(), DATE_ADD(NOW(), INTERVAL 11 DAY), DATE_ADD(NOW(), INTERVAL 14 DAY), 3000000, (SELECT id FROM users WHERE username = 'user1' LIMIT 1), (SELECT id FROM hotel WHERE name = 'Caravelle Saigon' LIMIT 1), (SELECT id FROM rooms WHERE Number = '3301' AND hotel_id = (SELECT id FROM hotel WHERE name = 'Caravelle Saigon' LIMIT 1) LIMIT 1)),
('PAID', NOW(), DATE_ADD(NOW(), INTERVAL 16 DAY), DATE_ADD(NOW(), INTERVAL 19 DAY), 5600000, (SELECT id FROM users WHERE username = 'user2' LIMIT 1), (SELECT id FROM hotel WHERE name = 'Sheraton Nha Trang' LIMIT 1), (SELECT id FROM rooms WHERE Number = '3701' AND hotel_id = (SELECT id FROM hotel WHERE name = 'Sheraton Nha Trang' LIMIT 1) LIMIT 1)),
('PAID', NOW(), DATE_ADD(NOW(), INTERVAL 8 DAY), DATE_ADD(NOW(), INTERVAL 11 DAY), 6000000, (SELECT id FROM users WHERE username = 'user1' LIMIT 1), (SELECT id FROM hotel WHERE name = 'Four Seasons Resort Hoi An' LIMIT 1), (SELECT id FROM rooms WHERE Number = '4001' AND hotel_id = (SELECT id FROM hotel WHERE name = 'Four Seasons Resort Hoi An' LIMIT 1) LIMIT 1)),
('PENDING', NOW(), DATE_ADD(NOW(), INTERVAL 14 DAY), DATE_ADD(NOW(), INTERVAL 17 DAY), 3600000, (SELECT id FROM users WHERE username = 'user2' LIMIT 1), (SELECT id FROM hotel WHERE name = 'La Residence Hue' LIMIT 1), (SELECT id FROM rooms WHERE Number = '4301' AND hotel_id = (SELECT id FROM hotel WHERE name = 'La Residence Hue' LIMIT 1) LIMIT 1));

-- Thêm reviews cho các hotels mới
INSERT IGNORE INTO hotel_reviews (rating, comment, hotel_id, user_id) VALUES
(5, 'Khách sạn 5 sao tuyệt vời! Dịch vụ đẳng cấp quốc tế.', (SELECT id FROM hotel WHERE name = 'Grand Mercure Danang' LIMIT 1), (SELECT id FROM users WHERE username = 'user1' LIMIT 1)),
(5, 'Trải nghiệm không thể quên! Mọi thứ đều hoàn hảo.', (SELECT id FROM hotel WHERE name = 'Grand Mercure Danang' LIMIT 1), (SELECT id FROM users WHERE username = 'user2' LIMIT 1)),
(4, 'Khách sạn hiện đại, view sông Hàn đẹp. Sẽ quay lại.', (SELECT id FROM hotel WHERE name = 'Novotel Danang' LIMIT 1), (SELECT id FROM users WHERE username = 'user1' LIMIT 1)),
(5, 'Phòng rộng rãi, tiện nghi đầy đủ. Nhân viên chuyên nghiệp.', (SELECT id FROM hotel WHERE name = 'Novotel Danang' LIMIT 1), (SELECT id FROM users WHERE username = 'user2' LIMIT 1)),
(5, 'Resort tuyệt vời! Spa và golf rất tốt.', (SELECT id FROM hotel WHERE name = 'Pullman Danang Beach Resort' LIMIT 1), (SELECT id FROM users WHERE username = 'user1' LIMIT 1)),
(5, 'Bãi biển riêng đẹp mê ly! Dịch vụ 5 sao.', (SELECT id FROM hotel WHERE name = 'Furama Resort Danang' LIMIT 1), (SELECT id FROM users WHERE username = 'user1' LIMIT 1)),
(4, 'Hồ bơi vô cực đẹp, view biển tuyệt vời.', (SELECT id FROM hotel WHERE name = 'A La Carte Danang Beach' LIMIT 1), (SELECT id FROM users WHERE username = 'user2' LIMIT 1)),
(3, 'Giá cả hợp lý, phòng sạch sẽ. Phù hợp cho ngân sách hạn chế.', (SELECT id FROM hotel WHERE name = 'Brilliant Hotel' LIMIT 1), (SELECT id FROM users WHERE username = 'user1' LIMIT 1)),
(4, 'Khách sạn ổn, vị trí trung tâm. Tiện lợi đi lại.', (SELECT id FROM hotel WHERE name = 'Golden Bay Hotel' LIMIT 1), (SELECT id FROM users WHERE username = 'user2' LIMIT 1)),
(3, 'Giá rẻ, gần biển. Phù hợp cho gia đình.', (SELECT id FROM hotel WHERE name = 'Seaside Hotel' LIMIT 1), (SELECT id FROM users WHERE username = 'user1' LIMIT 1)),
(4, 'Khách sạn boutique đẹp, phong cách độc đáo.', (SELECT id FROM hotel WHERE name = 'Ocean Villa Hotel' LIMIT 1), (SELECT id FROM users WHERE username = 'user2' LIMIT 1)),
(3, 'Giá rẻ, gần bãi biển. Phù hợp cho du khách tiết kiệm.', (SELECT id FROM hotel WHERE name = 'Sunny Beach Hotel' LIMIT 1), (SELECT id FROM users WHERE username = 'user1' LIMIT 1)),
(5, 'Khách sạn 5 sao ở trung tâm Hà Nội, view Hồ Gươm tuyệt đẹp!', (SELECT id FROM hotel WHERE name = 'Hanoi Grand Hotel' LIMIT 1), (SELECT id FROM users WHERE username = 'user1' LIMIT 1)),
(5, 'Kiến trúc Pháp cổ điển rất đẹp. Dịch vụ xuất sắc.', (SELECT id FROM hotel WHERE name = 'Sofitel Legend Metropole' LIMIT 1), (SELECT id FROM users WHERE username = 'user2' LIMIT 1)),
(4, 'Khách sạn boutique hiện đại, phong cách độc đáo.', (SELECT id FROM hotel WHERE name = 'Hanoi Boutique Hotel' LIMIT 1), (SELECT id FROM users WHERE username = 'user1' LIMIT 1)),
(4, 'Khách sạn lịch sử ở trung tâm Sài Gòn, rất tiện lợi.', (SELECT id FROM hotel WHERE name = 'Rex Hotel Saigon' LIMIT 1), (SELECT id FROM users WHERE username = 'user2' LIMIT 1)),
(5, 'Khách sạn 5 sao sang trọng, view thành phố đẹp.', (SELECT id FROM hotel WHERE name = 'Park Hyatt Saigon' LIMIT 1), (SELECT id FROM users WHERE username = 'user1' LIMIT 1)),
(3, 'Giá rẻ, gần chợ Bến Thành. Phù hợp cho ngân sách hạn chế.', (SELECT id FROM hotel WHERE name = 'Saigon Central Hotel' LIMIT 1), (SELECT id FROM users WHERE username = 'user2' LIMIT 1)),
(5, 'Resort trên đảo tuyệt vời! Bãi biển riêng đẹp mê ly.', (SELECT id FROM hotel WHERE name = 'Vinpearl Resort Nha Trang' LIMIT 1), (SELECT id FROM users WHERE username = 'user1' LIMIT 1)),
(5, 'Khách sạn 5 sao ven biển, view đẹp và dịch vụ tốt.', (SELECT id FROM hotel WHERE name = 'InterContinental Nha Trang' LIMIT 1), (SELECT id FROM users WHERE username = 'user2' LIMIT 1)),
(4, 'Khách sạn gần bãi biển, giá cả hợp lý.', (SELECT id FROM hotel WHERE name = 'Nha Trang Beach Hotel' LIMIT 1), (SELECT id FROM users WHERE username = 'user1' LIMIT 1)),
(5, 'Resort 5 sao bên sông với kiến trúc cổ rất đẹp.', (SELECT id FROM hotel WHERE name = 'Anantara Hoi An Resort' LIMIT 1), (SELECT id FROM users WHERE username = 'user2' LIMIT 1)),
(4, 'Khách sạn gần phố cổ Hội An, tiện lợi đi lại.', (SELECT id FROM hotel WHERE name = 'Hoi An Historic Hotel' LIMIT 1), (SELECT id FROM users WHERE username = 'user1' LIMIT 1)),
(4, 'Khách sạn gần Hoàng thành Huế, kiến trúc đẹp.', (SELECT id FROM hotel WHERE name = 'Imperial Hotel Hue' LIMIT 1), (SELECT id FROM users WHERE username = 'user2' LIMIT 1)),
(4, 'Resort boutique yên tĩnh, không gian đẹp.', (SELECT id FROM hotel WHERE name = 'Pilgrimage Village Boutique' LIMIT 1), (SELECT id FROM users WHERE username = 'user1' LIMIT 1)),
(4, 'Khách sạn gần Nhà hát Lớn, vị trí tốt.', (SELECT id FROM hotel WHERE name = 'Hanoi Opera Hotel' LIMIT 1), (SELECT id FROM users WHERE username = 'user2' LIMIT 1)),
(3, 'Giá rẻ, gần phố cổ. Phù hợp cho du khách tiết kiệm.', (SELECT id FROM hotel WHERE name = 'Hanoi Garden Hotel' LIMIT 1), (SELECT id FROM users WHERE username = 'user1' LIMIT 1)),
(4, 'View Hồ Gươm đẹp, dịch vụ tốt.', (SELECT id FROM hotel WHERE name = 'Hanoi Capital Hotel' LIMIT 1), (SELECT id FROM users WHERE username = 'user2' LIMIT 1)),
(5, 'Khách sạn 5 sao lịch sử, dịch vụ xuất sắc.', (SELECT id FROM hotel WHERE name = 'Caravelle Saigon' LIMIT 1), (SELECT id FROM users WHERE username = 'user1' LIMIT 1)),
(4, 'Ven sông Sài Gòn, view đẹp.', (SELECT id FROM hotel WHERE name = 'Majestic Saigon Hotel' LIMIT 1), (SELECT id FROM users WHERE username = 'user2' LIMIT 1)),
(3, 'Gần phố Tây Bùi Viện, giá rẻ.', (SELECT id FROM hotel WHERE name = 'Liberty Central Saigon' LIMIT 1), (SELECT id FROM users WHERE username = 'user1' LIMIT 1)),
(5, 'Khách sạn 5 sao sang trọng, dịch vụ đẳng cấp.', (SELECT id FROM hotel WHERE name = 'Sheraton Saigon' LIMIT 1), (SELECT id FROM users WHERE username = 'user2' LIMIT 1)),
(5, 'Khách sạn 5 sao ven biển, view tuyệt đẹp.', (SELECT id FROM hotel WHERE name = 'Sheraton Nha Trang' LIMIT 1), (SELECT id FROM users WHERE username = 'user1' LIMIT 1)),
(5, 'Resort cao cấp với spa tuyệt vời!', (SELECT id FROM hotel WHERE name = 'Amanoi Resort' LIMIT 1), (SELECT id FROM users WHERE username = 'user2' LIMIT 1)),
(4, 'Resort với bãi biển riêng, giá cả hợp lý.', (SELECT id FROM hotel WHERE name = 'Mia Resort Nha Trang' LIMIT 1), (SELECT id FROM users WHERE username = 'user1' LIMIT 1)),
(5, 'Resort 5 sao sang trọng ven biển, dịch vụ xuất sắc.', (SELECT id FROM hotel WHERE name = 'Four Seasons Resort Hoi An' LIMIT 1), (SELECT id FROM users WHERE username = 'user2' LIMIT 1)),
(4, 'Resort với hồ bơi lớn, phù hợp cho gia đình.', (SELECT id FROM hotel WHERE name = 'Palm Garden Beach Resort' LIMIT 1), (SELECT id FROM users WHERE username = 'user1' LIMIT 1)),
(4, 'Resort bên sông Thu Bồn, không gian yên tĩnh.', (SELECT id FROM hotel WHERE name = 'Hoi An Riverside Resort' LIMIT 1), (SELECT id FROM users WHERE username = 'user2' LIMIT 1)),
(4, 'Khách sạn với kiến trúc Art Deco đẹp.', (SELECT id FROM hotel WHERE name = 'La Residence Hue' LIMIT 1), (SELECT id FROM users WHERE username = 'user1' LIMIT 1)),
(4, 'Khách sạn boutique ven sông Hương, view đẹp.', (SELECT id FROM hotel WHERE name = 'Azerai La Residence' LIMIT 1), (SELECT id FROM users WHERE username = 'user2' LIMIT 1)),
(3, 'Giá rẻ, gần trung tâm. Phù hợp cho ngân sách hạn chế.', (SELECT id FROM hotel WHERE name = 'Moonlight Hotel Hue' LIMIT 1), (SELECT id FROM users WHERE username = 'user1' LIMIT 1));
-- Company Info
INSERT INTO company_info (`key`, `value`) VALUES
('name', 'Hotels Booking'),
('founded', '2010'),
('mission', 'Mang đến trải nghiệm đặt phòng khách sạn tốt nhất cho khách hàng với giá cả hợp lý, dịch vụ chất lượng và hỗ trợ 24/7.'),
('vision', 'Trở thành nền tảng đặt phòng khách sạn hàng đầu tại Việt Nam và khu vực Đông Nam Á.')
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

-- FAQs (sử dụng INSERT IGNORE để tránh duplicate)
INSERT IGNORE INTO faq (question, answer, display_order) VALUES
('Làm thế nào để đặt phòng?', 'Bạn có thể đặt phòng bằng cách tìm kiếm khách sạn trên trang chủ, chọn ngày nhận phòng và trả phòng, sau đó chọn phòng phù hợp và thanh toán.', 1),
('Tôi có thể hủy đặt phòng không?', 'Có, bạn có thể hủy đặt phòng trong vòng 24 giờ trước ngày nhận phòng. Vui lòng kiểm tra chính sách hủy của từng khách sạn.', 2),
('Phương thức thanh toán nào được chấp nhận?', 'Chúng tôi chấp nhận thanh toán bằng thẻ tín dụng, thẻ ghi nợ, chuyển khoản ngân hàng và các ví điện tử phổ biến.', 3),
('Làm sao để liên hệ hỗ trợ khách hàng?', 'Bạn có thể liên hệ chúng tôi qua email support@hotelsbooking.com, hotline +84 123 456 789 hoặc sử dụng chatbox trên website. Chúng tôi hỗ trợ 24/7.', 4),
('Có phí ẩn nào không?', 'Không, chúng tôi minh bạch về giá cả. Tất cả các khoản phí đều được hiển thị rõ ràng trước khi bạn xác nhận đặt phòng.', 5);

-- Contact Info (sử dụng INSERT IGNORE để tránh duplicate)
INSERT IGNORE INTO contact_info (type, title, content, link, display_order) VALUES
('email', 'Email', 'support@hotelsbooking.com', 'mailto:support@hotelsbooking.com', 1),
('phone', 'Điện thoại', '+84 123 456 789', 'tel:+84123456789', 2),
('address', 'Địa chỉ', '123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh, Việt Nam', 'https://maps.google.com', 3),
('hours', 'Giờ làm việc', '24/7 - Hỗ trợ mọi lúc', '#', 4);

-- Offices (sử dụng INSERT IGNORE để tránh duplicate)
INSERT IGNORE INTO office (name, address, phone, email, hours, latitude, longitude, display_order) VALUES
('Trụ sở chính - TP. Hồ Chí Minh', '123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh', '+84 123 456 789', 'hcm@hotelsbooking.com', 'Thứ 2 - Chủ nhật: 8:00 - 20:00', 10.8231, 106.6297, 1),
('Văn phòng Hà Nội', '456 Đường DEF, Quận GHI, Hà Nội', '+84 987 654 321', 'hanoi@hotelsbooking.com', 'Thứ 2 - Chủ nhật: 8:00 - 20:00', 21.0285, 105.8542, 2),
('Văn phòng Đà Nẵng', '789 Đường JKL, Quận MNO, Đà Nẵng', '+84 555 123 456', 'danang@hotelsbooking.com', 'Thứ 2 - Chủ nhật: 8:00 - 20:00', 16.0544, 108.2022, 3);

-- Admin Percent (mặc định 10% = 0.1)
-- Lưu ý: Tên cột trong database là admin_percent (snake_case)
INSERT IGNORE INTO Percen (id, admin_percent) VALUES (1, 0.1);

-- ============================================
-- XÓA DUPLICATE CUỐI CÙNG (Sau khi insert tất cả dữ liệu)
-- ============================================
-- Đảm bảo xóa tất cả duplicate sau khi insert để database luôn sạch
SET FOREIGN_KEY_CHECKS = 0;

-- Xóa duplicate hotels và các bản ghi liên quan (lần cuối)
DELETE r FROM rooms r
INNER JOIN hotel h1 ON r.hotel_id = h1.id
INNER JOIN hotel h2 
ON h1.name = h2.name 
AND h1.owner_user = h2.owner_user
AND h1.deleted = h2.deleted
WHERE h1.id > h2.id;

DELETE hi FROM hotel_images hi
INNER JOIN hotel h1 ON hi.hotel_id = h1.id
INNER JOIN hotel h2 
ON h1.name = h2.name 
AND h1.owner_user = h2.owner_user
AND h1.deleted = h2.deleted
WHERE h1.id > h2.id;

DELETE hr FROM hotel_reviews hr
INNER JOIN hotel h1 ON hr.hotel_id = h1.id
INNER JOIN hotel h2 
ON h1.name = h2.name 
AND h1.owner_user = h2.owner_user
AND h1.deleted = h2.deleted
WHERE h1.id > h2.id;

DELETE b FROM booking b
INNER JOIN hotel h1 ON b.hotel_id = h1.id
INNER JOIN hotel h2 
ON h1.name = h2.name 
AND h1.owner_user = h2.owner_user
AND h1.deleted = h2.deleted
WHERE h1.id > h2.id;

-- Xóa duplicate hotels (giữ lại bản có ID nhỏ nhất)
DELETE h1 FROM hotel h1
INNER JOIN hotel h2 
ON h1.name = h2.name 
AND h1.owner_user = h2.owner_user
AND h1.deleted = h2.deleted
WHERE h1.id > h2.id;

-- Xóa duplicate các bảng khác (lần cuối)
DELETE hi1 FROM hotel_images hi1
INNER JOIN hotel_images hi2 
ON hi1.hotel_id = hi2.hotel_id 
AND hi1.image_url = hi2.image_url 
AND hi1.display_order = hi2.display_order
AND hi1.deleted = hi2.deleted
WHERE hi1.id > hi2.id;

DELETE hr1 FROM hotel_reviews hr1
INNER JOIN hotel_reviews hr2 
ON hr1.hotel_id = hr2.hotel_id 
AND hr1.user_id = hr2.user_id
WHERE hr1.id > hr2.id;

DELETE b1 FROM booking b1
INNER JOIN booking b2 
ON b1.user_id = b2.user_id 
AND b1.hotel_id = b2.hotel_id 
AND b1.rooms_id = b2.rooms_id 
AND b1.check_in_date = b2.check_in_date
WHERE b1.id > b2.id;

DELETE r1 FROM rooms r1
INNER JOIN rooms r2 
ON r1.Number = r2.Number 
AND r1.hotel_id = r2.hotel_id
AND r1.deleted = r2.deleted
WHERE r1.id > r2.id;

DELETE ci1 FROM contact_info ci1
INNER JOIN contact_info ci2 
ON ci1.type = ci2.type 
AND ci1.display_order = ci2.display_order
WHERE ci1.id > ci2.id;

DELETE o1 FROM office o1
INNER JOIN office o2 
ON o1.name = o2.name
WHERE o1.id > o2.id;

DELETE f1 FROM faq f1
INNER JOIN faq f2 
ON f1.question = f2.question
WHERE f1.id > f2.id;

DELETE ci1 FROM company_info ci1
INNER JOIN company_info ci2 
ON ci1.`key` = ci2.`key`
WHERE ci1.id > ci2.id;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- COMPLETE!
-- ============================================
-- Hiển thị thống kê sau khi setup
SELECT 
    '✅ Database setup hoàn tất! Tất cả bảng và dữ liệu đã được tạo.' AS message,
    (SELECT COUNT(*) FROM hotel WHERE deleted = FALSE) AS total_hotels,
    (SELECT COUNT(*) FROM rooms WHERE deleted = FALSE) AS total_rooms,
    (SELECT COUNT(*) FROM users) AS total_users,
    (SELECT COUNT(*) FROM hotel_images WHERE deleted = FALSE) AS total_hotel_images;

