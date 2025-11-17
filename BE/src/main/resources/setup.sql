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

-- ============================================
-- PART 2: SEED DATA FOR MAIN APPLICATION
-- ============================================

-- Insert Roles
INSERT INTO roles (name) VALUES ('USER'), ('OWNER'), ('ADMIN') 
ON DUPLICATE KEY UPDATE name=name;

-- Insert Users (password is '123456' hashed with BCrypt)
-- Note: In production, use proper password hashing
INSERT INTO users (username, email, password, phone, verified, role_id) VALUES
('admin', 'admin@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK8p6LK', '0123456789', true, (SELECT id FROM roles WHERE name = 'ADMIN' LIMIT 1)),
('owner1', 'owner1@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK8p6LK', '0123456780', true, (SELECT id FROM roles WHERE name = 'OWNER' LIMIT 1)),
('owner2', 'owner2@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK8p6LK', '0123456781', true, (SELECT id FROM roles WHERE name = 'OWNER' LIMIT 1)),
('user1', 'user1@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK8p6LK', '0123456782', true, (SELECT id FROM roles WHERE name = 'USER' LIMIT 1)),
('user2', 'user2@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK8p6LK', '0123456783', true, (SELECT id FROM roles WHERE name = 'USER' LIMIT 1))
ON DUPLICATE KEY UPDATE 
  email=VALUES(email),
  password=VALUES(password),
  phone=VALUES(phone),
  verified=VALUES(verified),
  role_id=VALUES(role_id);

-- Insert Wallets for users (using subquery to get actual user IDs)
INSERT INTO wallets (user_id, balance) 
SELECT id, 10000000.00 FROM users WHERE username = 'admin'
ON DUPLICATE KEY UPDATE balance=10000000.00;

INSERT INTO wallets (user_id, balance) 
SELECT id, 5000000.00 FROM users WHERE username = 'owner1'
ON DUPLICATE KEY UPDATE balance=5000000.00;

INSERT INTO wallets (user_id, balance) 
SELECT id, 5000000.00 FROM users WHERE username = 'owner2'
ON DUPLICATE KEY UPDATE balance=5000000.00;

INSERT INTO wallets (user_id, balance) 
SELECT id, 2000000.00 FROM users WHERE username = 'user1'
ON DUPLICATE KEY UPDATE balance=2000000.00;

INSERT INTO wallets (user_id, balance) 
SELECT id, 2000000.00 FROM users WHERE username = 'user2'
ON DUPLICATE KEY UPDATE balance=2000000.00;

-- Insert Hotels (using subquery to get owner user IDs)
INSERT INTO hotel (name, address, city, phone, description, image, rating, status, owner_user) VALUES
('Mường Thanh Hotel', '123 Đường Bạch Đằng, Quận Hải Châu', 'Đà Nẵng', '0236123456', 'Khách sạn 4 sao với view biển tuyệt đẹp, gần bãi biển Mỹ Khê', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 4, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1)),
('Century Hotel', '456 Đường Trần Phú, Quận Hải Châu', 'Đà Nẵng', '0236123457', 'Khách sạn hiện đại ở trung tâm thành phố, gần các điểm du lịch', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 5, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1)),
('Lanmard 81 Hotel', '789 Đường Nguyễn Văn Linh, Quận Thanh Khê', 'Đà Nẵng', '0236123458', 'Khách sạn giá rẻ, phù hợp cho du khách tiết kiệm', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', 3, 'success', (SELECT id FROM users WHERE username = 'owner2' LIMIT 1)),
('Vin Hotel', '321 Đường Võ Nguyên Giáp, Quận Sơn Trà', 'Đà Nẵng', '0236123459', 'Khách sạn 5 sao sang trọng với đầy đủ tiện nghi cao cấp', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', 5, 'success', (SELECT id FROM users WHERE username = 'owner2' LIMIT 1)),
('Bình An Hotel', '654 Đường Lê Duẩn, Quận Hải Châu', 'Đà Nẵng', '0236123460', 'Khách sạn 3 sao thân thiện, gần chợ và các nhà hàng', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', 4, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1))
ON DUPLICATE KEY UPDATE name=VALUES(name), address=VALUES(address), city=VALUES(city), phone=VALUES(phone), description=VALUES(description), image=VALUES(image), rating=VALUES(rating), status=VALUES(status);

-- Insert Rooms
INSERT INTO rooms (Number, type, status, price, capacity, image, discount_percent, hotel_id) VALUES
-- Rooms for Hotel 1 (Mường Thanh Hotel)
('101', 'DELUXE', 'AVAILABLE', 1500000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.1, (SELECT id FROM hotel WHERE name = 'Mường Thanh Hotel' LIMIT 1)),
('102', 'STANDARD', 'AVAILABLE', 1200000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Mường Thanh Hotel' LIMIT 1)),
('103', 'SUITE', 'AVAILABLE', 2000000, 4, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.15, (SELECT id FROM hotel WHERE name = 'Mường Thanh Hotel' LIMIT 1)),
('201', 'DELUXE', 'AVAILABLE', 1600000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Mường Thanh Hotel' LIMIT 1)),
('202', 'FAMILY', 'AVAILABLE', 1800000, 4, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.1, (SELECT id FROM hotel WHERE name = 'Mường Thanh Hotel' LIMIT 1)),

-- Rooms for Hotel 2 (Century Hotel)
('301', 'EXECUTIVE', 'AVAILABLE', 2500000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.2, (SELECT id FROM hotel WHERE name = 'Century Hotel' LIMIT 1)),
('302', 'SUITE', 'AVAILABLE', 3000000, 4, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.15, (SELECT id FROM hotel WHERE name = 'Century Hotel' LIMIT 1)),
('303', 'DELUXE', 'AVAILABLE', 2000000, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.1, (SELECT id FROM hotel WHERE name = 'Century Hotel' LIMIT 1)),

-- Rooms for Hotel 3 (Lanmard 81 Hotel)
('401', 'STANDARD', 'AVAILABLE', 800000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Lanmard 81 Hotel' LIMIT 1)),
('402', 'STANDARD', 'AVAILABLE', 850000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.05, (SELECT id FROM hotel WHERE name = 'Lanmard 81 Hotel' LIMIT 1)),
('403', 'FAMILY', 'AVAILABLE', 1200000, 4, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Lanmard 81 Hotel' LIMIT 1)),

-- Rooms for Hotel 4 (Vin Hotel)
('501', 'SUITE', 'AVAILABLE', 4000000, 4, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.25, (SELECT id FROM hotel WHERE name = 'Vin Hotel' LIMIT 1)),
('502', 'EXECUTIVE', 'AVAILABLE', 3500000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.2, (SELECT id FROM hotel WHERE name = 'Vin Hotel' LIMIT 1)),
('503', 'DELUXE', 'AVAILABLE', 3000000, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.15, (SELECT id FROM hotel WHERE name = 'Vin Hotel' LIMIT 1)),

-- Rooms for Hotel 5 (Bình An Hotel)
('601', 'STANDARD', 'AVAILABLE', 1000000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Bình An Hotel' LIMIT 1)),
('602', 'DELUXE', 'AVAILABLE', 1300000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.1, (SELECT id FROM hotel WHERE name = 'Bình An Hotel' LIMIT 1)),
('603', 'FAMILY', 'AVAILABLE', 1500000, 4, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Bình An Hotel' LIMIT 1))
ON DUPLICATE KEY UPDATE Number=VALUES(Number);

-- Insert Hotel Reviews
INSERT INTO hotel_reviews (rating, comment, hotel_id, user_id) VALUES
(5, 'Khách sạn rất đẹp, view biển tuyệt vời! Nhân viên phục vụ nhiệt tình.', (SELECT id FROM hotel WHERE name = 'Mường Thanh Hotel' LIMIT 1), (SELECT id FROM users WHERE username = 'user1' LIMIT 1)),
(4, 'Phòng sạch sẽ, giá cả hợp lý. Sẽ quay lại lần sau.', (SELECT id FROM hotel WHERE name = 'Mường Thanh Hotel' LIMIT 1), (SELECT id FROM users WHERE username = 'user2' LIMIT 1)),
(5, 'Khách sạn 5 sao đúng nghĩa! Mọi thứ đều hoàn hảo.', (SELECT id FROM hotel WHERE name = 'Century Hotel' LIMIT 1), (SELECT id FROM users WHERE username = 'user1' LIMIT 1)),
(4, 'Vị trí tốt, gần trung tâm. Phòng rộng rãi và thoáng mát.', (SELECT id FROM hotel WHERE name = 'Century Hotel' LIMIT 1), (SELECT id FROM users WHERE username = 'user2' LIMIT 1)),
(3, 'Giá rẻ nhưng chất lượng cũng tương ứng. Phù hợp cho ngân sách hạn chế.', (SELECT id FROM hotel WHERE name = 'Lanmard 81 Hotel' LIMIT 1), (SELECT id FROM users WHERE username = 'user1' LIMIT 1)),
(4, 'Khách sạn sang trọng, đầy đủ tiện nghi. Đáng giá đồng tiền.', (SELECT id FROM hotel WHERE name = 'Vin Hotel' LIMIT 1), (SELECT id FROM users WHERE username = 'user1' LIMIT 1)),
(5, 'Trải nghiệm tuyệt vời! Phòng view đẹp, dịch vụ tốt.', (SELECT id FROM hotel WHERE name = 'Vin Hotel' LIMIT 1), (SELECT id FROM users WHERE username = 'user2' LIMIT 1)),
(4, 'Khách sạn ổn, giá cả phải chăng. Nhân viên thân thiện.', (SELECT id FROM hotel WHERE name = 'Bình An Hotel' LIMIT 1), (SELECT id FROM users WHERE username = 'user1' LIMIT 1))
ON DUPLICATE KEY UPDATE comment=VALUES(comment);

-- Insert Sample Bookings
INSERT INTO booking (status, booking_date, check_in_date, check_out_date, total_price, user_id, hotel_id, rooms_id) VALUES
('PAID', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 10 DAY), 4500000, (SELECT id FROM users WHERE username = 'user1' LIMIT 1), (SELECT id FROM hotel WHERE name = 'Mường Thanh Hotel' LIMIT 1), (SELECT id FROM rooms WHERE Number = '101' AND hotel_id = (SELECT id FROM hotel WHERE name = 'Mường Thanh Hotel' LIMIT 1) LIMIT 1)),
('PENDING', NOW(), DATE_ADD(NOW(), INTERVAL 14 DAY), DATE_ADD(NOW(), INTERVAL 17 DAY), 7200000, (SELECT id FROM users WHERE username = 'user2' LIMIT 1), (SELECT id FROM hotel WHERE name = 'Century Hotel' LIMIT 1), (SELECT id FROM rooms WHERE Number = '301' AND hotel_id = (SELECT id FROM hotel WHERE name = 'Century Hotel' LIMIT 1) LIMIT 1)),
('PAID', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), NOW(), 3600000, (SELECT id FROM users WHERE username = 'user1' LIMIT 1), (SELECT id FROM hotel WHERE name = 'Lanmard 81 Hotel' LIMIT 1), (SELECT id FROM rooms WHERE Number = '401' AND hotel_id = (SELECT id FROM hotel WHERE name = 'Lanmard 81 Hotel' LIMIT 1) LIMIT 1)),
('PAID', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY), 5400000, (SELECT id FROM users WHERE username = 'user1' LIMIT 1), (SELECT id FROM hotel WHERE name = 'Vin Hotel' LIMIT 1), (SELECT id FROM rooms WHERE Number = '501' AND hotel_id = (SELECT id FROM hotel WHERE name = 'Vin Hotel' LIMIT 1) LIMIT 1)),
('PENDING', NOW(), DATE_ADD(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 6 DAY), 2400000, (SELECT id FROM users WHERE username = 'user2' LIMIT 1), (SELECT id FROM hotel WHERE name = 'Bình An Hotel' LIMIT 1), (SELECT id FROM rooms WHERE Number = '601' AND hotel_id = (SELECT id FROM hotel WHERE name = 'Bình An Hotel' LIMIT 1) LIMIT 1))
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- Thêm thêm hotels (Đà Nẵng)
INSERT INTO hotel (name, address, city, phone, description, image, rating, status, owner_user) VALUES
('Sao La Hotel', '111 Đường Lê Lợi, Quận Hải Châu', 'Đà Nẵng', '0236123461', 'Khách sạn 4 sao hiện đại với view thành phố', 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', 4, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1)),
('Madonna Hotel', '222 Đường Hoàng Diệu, Quận Sơn Trà', 'Đà Nẵng', '0236123462', 'Khách sạn 3 sao gần biển, giá cả hợp lý', 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', 3, 'success', (SELECT id FROM users WHERE username = 'owner2' LIMIT 1)),
('Wind Hotel', '333 Đường Phạm Văn Đồng, Quận Sơn Trà', 'Đà Nẵng', '0236123463', 'Khách sạn boutique với phong cách độc đáo', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 4, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1)),
('SALA Hotel', '444 Đường Bạch Đằng, Quận Hải Châu', 'Đà Nẵng', '0236123464', 'Khách sạn 4 sao ven biển với hồ bơi vô cực', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 4, 'success', (SELECT id FROM users WHERE username = 'owner2' LIMIT 1)),
('Davue Hotel Da Nang', '555 Đường Trần Phú, Quận Hải Châu', 'Đà Nẵng', '0236123465', 'Khách sạn 3 sao gần trung tâm, tiện lợi', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', 3, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1))
ON DUPLICATE KEY UPDATE name=VALUES(name), address=VALUES(address), city=VALUES(city), phone=VALUES(phone), description=VALUES(description), image=VALUES(image), rating=VALUES(rating), status=VALUES(status);

-- Thêm rooms cho các hotels mới
INSERT INTO rooms (Number, type, status, price, capacity, image, discount_percent, hotel_id) VALUES
-- Rooms for Sao La Hotel
('701', 'DELUXE', 'AVAILABLE', 1400000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.1, (SELECT id FROM hotel WHERE name = 'Sao La Hotel' LIMIT 1)),
('702', 'STANDARD', 'AVAILABLE', 1100000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Sao La Hotel' LIMIT 1)),
('703', 'FAMILY', 'AVAILABLE', 1700000, 4, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.15, (SELECT id FROM hotel WHERE name = 'Sao La Hotel' LIMIT 1)),

-- Rooms for Madonna Hotel
('801', 'STANDARD', 'AVAILABLE', 900000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Madonna Hotel' LIMIT 1)),
('802', 'STANDARD', 'AVAILABLE', 950000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.05, (SELECT id FROM hotel WHERE name = 'Madonna Hotel' LIMIT 1)),

-- Rooms for Wind Hotel
('901', 'DELUXE', 'AVAILABLE', 1500000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.1, (SELECT id FROM hotel WHERE name = 'Wind Hotel' LIMIT 1)),
('902', 'SUITE', 'AVAILABLE', 2200000, 4, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.2, (SELECT id FROM hotel WHERE name = 'Wind Hotel' LIMIT 1)),

-- Rooms for SALA Hotel
('1001', 'DELUXE', 'AVAILABLE', 1600000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.1, (SELECT id FROM hotel WHERE name = 'SALA Hotel' LIMIT 1)),
('1002', 'SUITE', 'AVAILABLE', 2500000, 4, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.15, (SELECT id FROM hotel WHERE name = 'SALA Hotel' LIMIT 1)),
('1003', 'EXECUTIVE', 'AVAILABLE', 2000000, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.12, (SELECT id FROM hotel WHERE name = 'SALA Hotel' LIMIT 1)),

-- Rooms for Davue Hotel Da Nang
('1101', 'STANDARD', 'AVAILABLE', 700000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Davue Hotel Da Nang' LIMIT 1)),
('1102', 'STANDARD', 'AVAILABLE', 750000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Davue Hotel Da Nang' LIMIT 1)),
('1103', 'FAMILY', 'AVAILABLE', 1100000, 4, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.1, (SELECT id FROM hotel WHERE name = 'Davue Hotel Da Nang' LIMIT 1))
ON DUPLICATE KEY UPDATE Number=VALUES(Number);

-- Thêm thêm reviews
INSERT INTO hotel_reviews (rating, comment, hotel_id, user_id) VALUES
(5, 'Khách sạn mới, sạch sẽ và hiện đại. Rất hài lòng!', (SELECT id FROM hotel WHERE name = 'Sao La Hotel' LIMIT 1), (SELECT id FROM users WHERE username = 'user1' LIMIT 1)),
(4, 'Giá cả hợp lý, phòng đẹp. Nhân viên nhiệt tình.', (SELECT id FROM hotel WHERE name = 'Sao La Hotel' LIMIT 1), (SELECT id FROM users WHERE username = 'user2' LIMIT 1)),
(4, 'Vị trí tốt, gần biển. Phù hợp cho gia đình.', (SELECT id FROM hotel WHERE name = 'Madonna Hotel' LIMIT 1), (SELECT id FROM users WHERE username = 'user1' LIMIT 1)),
(3, 'Khách sạn ổn, giá rẻ nhưng cần cải thiện dịch vụ.', (SELECT id FROM hotel WHERE name = 'Madonna Hotel' LIMIT 1), (SELECT id FROM users WHERE username = 'user2' LIMIT 1)),
(5, 'Khách sạn boutique rất đẹp! Phong cách độc đáo.', (SELECT id FROM hotel WHERE name = 'Wind Hotel' LIMIT 1), (SELECT id FROM users WHERE username = 'user1' LIMIT 1)),
(4, 'Phòng rộng rãi, view đẹp. Sẽ quay lại.', (SELECT id FROM hotel WHERE name = 'Wind Hotel' LIMIT 1), (SELECT id FROM users WHERE username = 'user2' LIMIT 1)),
(5, 'Hồ bơi vô cực tuyệt vời! View biển đẹp mê ly.', (SELECT id FROM hotel WHERE name = 'SALA Hotel' LIMIT 1), (SELECT id FROM users WHERE username = 'user1' LIMIT 1)),
(4, 'Khách sạn sang trọng, đầy đủ tiện nghi.', (SELECT id FROM hotel WHERE name = 'SALA Hotel' LIMIT 1), (SELECT id FROM users WHERE username = 'user2' LIMIT 1)),
(3, 'Giá rẻ, phù hợp cho ngân sách hạn chế.', (SELECT id FROM hotel WHERE name = 'Davue Hotel Da Nang' LIMIT 1), (SELECT id FROM users WHERE username = 'user1' LIMIT 1)),
(4, 'Vị trí trung tâm, tiện lợi đi lại.', (SELECT id FROM hotel WHERE name = 'Davue Hotel Da Nang' LIMIT 1), (SELECT id FROM users WHERE username = 'user2' LIMIT 1))
ON DUPLICATE KEY UPDATE comment=VALUES(comment);

-- Thêm nhiều hotels hơn để test đầy đủ (Đà Nẵng)
INSERT INTO hotel (name, address, city, phone, description, image, rating, status, owner_user) VALUES
('Grand Mercure Danang', '666 Đường Võ Nguyên Giáp, Quận Sơn Trà', 'Đà Nẵng', '0236123466', 'Khách sạn 5 sao quốc tế với dịch vụ cao cấp', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 5, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1)),
('Novotel Danang', '777 Đường Bạch Đằng, Quận Hải Châu', 'Đà Nẵng', '0236123467', 'Khách sạn 4 sao hiện đại với view sông Hàn', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 4, 'success', (SELECT id FROM users WHERE username = 'owner2' LIMIT 1)),
('Pullman Danang Beach Resort', '888 Đường Võ Nguyên Giáp, Quận Sơn Trà', 'Đà Nẵng', '0236123468', 'Resort 5 sao ven biển với spa và golf', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', 5, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1)),
('Furama Resort Danang', '999 Đường Võ Nguyên Giáp, Quận Sơn Trà', 'Đà Nẵng', '0236123469', 'Resort 5 sao sang trọng với bãi biển riêng', 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', 5, 'success', (SELECT id FROM users WHERE username = 'owner2' LIMIT 1)),
('A La Carte Danang Beach', '111 Đường Võ Nguyên Giáp, Quận Sơn Trà', 'Đà Nẵng', '0236123470', 'Khách sạn 4 sao với hồ bơi vô cực và view biển', 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', 4, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1)),
('Brilliant Hotel', '222 Đường Trần Phú, Quận Hải Châu', 'Đà Nẵng', '0236123471', 'Khách sạn 3 sao gần trung tâm, giá cả hợp lý', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', 3, 'success', (SELECT id FROM users WHERE username = 'owner2' LIMIT 1)),
('Golden Bay Hotel', '333 Đường Lê Duẩn, Quận Hải Châu', 'Đà Nẵng', '0236123472', 'Khách sạn 4 sao với phòng view thành phố', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', 4, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1)),
('Seaside Hotel', '444 Đường Nguyễn Văn Linh, Quận Thanh Khê', 'Đà Nẵng', '0236123473', 'Khách sạn 3 sao gần biển, phù hợp cho gia đình', 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800', 3, 'success', (SELECT id FROM users WHERE username = 'owner2' LIMIT 1)),
('Ocean Villa Hotel', '555 Đường Hoàng Diệu, Quận Sơn Trà', 'Đà Nẵng', '0236123474', 'Khách sạn boutique 4 sao với phong cách độc đáo', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', 4, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1)),
('Sunny Beach Hotel', '666 Đường Phạm Văn Đồng, Quận Sơn Trà', 'Đà Nẵng', '0236123475', 'Khách sạn 3 sao giá rẻ, gần bãi biển', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', 3, 'success', (SELECT id FROM users WHERE username = 'owner2' LIMIT 1))
ON DUPLICATE KEY UPDATE name=VALUES(name), address=VALUES(address), city=VALUES(city), phone=VALUES(phone), description=VALUES(description), image=VALUES(image), rating=VALUES(rating), status=VALUES(status);

-- Thêm hotels ở các thành phố khác
INSERT INTO hotel (name, address, city, phone, description, image, rating, status, owner_user) VALUES
-- Hà Nội
('Hanoi Grand Hotel', '123 Phố Tràng Tiền, Hoàn Kiếm', 'Hà Nội', '0241234567', 'Khách sạn 5 sao ở trung tâm Hà Nội, gần Hồ Hoàn Kiếm', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 5, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1)),
('Sofitel Legend Metropole', '15 Phố Ngô Quyền, Hoàn Kiếm', 'Hà Nội', '0241234568', 'Khách sạn lịch sử 5 sao với kiến trúc Pháp cổ điển', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 5, 'success', (SELECT id FROM users WHERE username = 'owner2' LIMIT 1)),
('Hanoi Boutique Hotel', '456 Phố Lý Thường Kiệt, Hoàn Kiếm', 'Hà Nội', '0241234569', 'Khách sạn boutique 4 sao với phong cách hiện đại', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', 4, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1)),
-- Hồ Chí Minh
('Rex Hotel Saigon', '141 Nguyễn Huệ, Quận 1', 'Hồ Chí Minh', '0281234567', 'Khách sạn 4 sao lịch sử ở trung tâm Sài Gòn', 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', 4, 'success', (SELECT id FROM users WHERE username = 'owner2' LIMIT 1)),
('Park Hyatt Saigon', '2 Lam Sơn Square, Quận 1', 'Hồ Chí Minh', '0281234568', 'Khách sạn 5 sao sang trọng với view thành phố', 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', 5, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1)),
('Saigon Central Hotel', '789 Đường Lê Lợi, Quận 1', 'Hồ Chí Minh', '0281234569', 'Khách sạn 3 sao gần chợ Bến Thành', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', 3, 'success', (SELECT id FROM users WHERE username = 'owner2' LIMIT 1)),
-- Nha Trang
('Vinpearl Resort Nha Trang', 'Đảo Hòn Tre, Vịnh Nha Trang', 'Nha Trang', '0258123456', 'Resort 5 sao trên đảo với bãi biển riêng', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', 5, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1)),
('InterContinental Nha Trang', '32-34 Trần Phú, Nha Trang', 'Nha Trang', '0258123457', 'Khách sạn 5 sao ven biển với view đẹp', 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800', 5, 'success', (SELECT id FROM users WHERE username = 'owner2' LIMIT 1)),
('Nha Trang Beach Hotel', '123 Trần Phú, Nha Trang', 'Nha Trang', '0258123458', 'Khách sạn 4 sao gần bãi biển', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', 4, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1)),
-- Hội An
('Anantara Hoi An Resort', '1 Phạm Hồng Thái, Hội An', 'Hội An', '0235123456', 'Resort 5 sao bên sông với kiến trúc cổ', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', 5, 'success', (SELECT id FROM users WHERE username = 'owner2' LIMIT 1)),
('Hoi An Historic Hotel', '10 Trần Phú, Hội An', 'Hội An', '0235123457', 'Khách sạn 4 sao gần phố cổ Hội An', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 4, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1)),
-- Huế
('Imperial Hotel Hue', '8 Hùng Vương, Huế', 'Huế', '0234123456', 'Khách sạn 4 sao gần Hoàng thành Huế', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 4, 'success', (SELECT id FROM users WHERE username = 'owner2' LIMIT 1)),
('Pilgrimage Village Boutique', '130 Minh Mạng, Huế', 'Huế', '0234123457', 'Resort boutique 4 sao với không gian yên tĩnh', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', 4, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1))
ON DUPLICATE KEY UPDATE name=VALUES(name), address=VALUES(address), city=VALUES(city), phone=VALUES(phone), description=VALUES(description), image=VALUES(image), rating=VALUES(rating), status=VALUES(status);

-- Thêm rooms cho các hotels mới (đảm bảo mỗi hotel có ít nhất 3-5 rooms với giá đa dạng)
INSERT INTO rooms (Number, type, status, price, capacity, image, discount_percent, hotel_id) VALUES
-- Rooms for Grand Mercure Danang
('1201', 'SUITE', 'AVAILABLE', 5000000, 4, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.2, (SELECT id FROM hotel WHERE name = 'Grand Mercure Danang' LIMIT 1)),
('1202', 'EXECUTIVE', 'AVAILABLE', 4500000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.15, (SELECT id FROM hotel WHERE name = 'Grand Mercure Danang' LIMIT 1)),
('1203', 'DELUXE', 'AVAILABLE', 4000000, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.1, (SELECT id FROM hotel WHERE name = 'Grand Mercure Danang' LIMIT 1)),
('1204', 'FAMILY', 'AVAILABLE', 5500000, 4, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.25, (SELECT id FROM hotel WHERE name = 'Grand Mercure Danang' LIMIT 1)),
('1205', 'STANDARD', 'AVAILABLE', 3500000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Grand Mercure Danang' LIMIT 1)),

-- Rooms for Novotel Danang
('1301', 'DELUXE', 'AVAILABLE', 2800000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.1, (SELECT id FROM hotel WHERE name = 'Novotel Danang' LIMIT 1)),
('1302', 'SUITE', 'AVAILABLE', 3500000, 4, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.15, (SELECT id FROM hotel WHERE name = 'Novotel Danang' LIMIT 1)),
('1303', 'EXECUTIVE', 'AVAILABLE', 3200000, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.12, (SELECT id FROM hotel WHERE name = 'Novotel Danang' LIMIT 1)),
('1304', 'STANDARD', 'AVAILABLE', 2400000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Novotel Danang' LIMIT 1)),
('1305', 'FAMILY', 'AVAILABLE', 3800000, 4, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.2, (SELECT id FROM hotel WHERE name = 'Novotel Danang' LIMIT 1)),

-- Rooms for Pullman Danang Beach Resort
('1401', 'SUITE', 'AVAILABLE', 6000000, 4, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.3, (SELECT id FROM hotel WHERE name = 'Pullman Danang Beach Resort' LIMIT 1)),
('1402', 'EXECUTIVE', 'AVAILABLE', 5500000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.25, (SELECT id FROM hotel WHERE name = 'Pullman Danang Beach Resort' LIMIT 1)),
('1403', 'DELUXE', 'AVAILABLE', 5000000, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.2, (SELECT id FROM hotel WHERE name = 'Pullman Danang Beach Resort' LIMIT 1)),
('1404', 'FAMILY', 'AVAILABLE', 6500000, 4, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.3, (SELECT id FROM hotel WHERE name = 'Pullman Danang Beach Resort' LIMIT 1)),
('1405', 'STANDARD', 'AVAILABLE', 4500000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.15, (SELECT id FROM hotel WHERE name = 'Pullman Danang Beach Resort' LIMIT 1)),

-- Rooms for Furama Resort Danang
('1501', 'SUITE', 'AVAILABLE', 7000000, 4, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.35, (SELECT id FROM hotel WHERE name = 'Furama Resort Danang' LIMIT 1)),
('1502', 'EXECUTIVE', 'AVAILABLE', 6500000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.3, (SELECT id FROM hotel WHERE name = 'Furama Resort Danang' LIMIT 1)),
('1503', 'DELUXE', 'AVAILABLE', 6000000, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.25, (SELECT id FROM hotel WHERE name = 'Furama Resort Danang' LIMIT 1)),
('1504', 'FAMILY', 'AVAILABLE', 7500000, 4, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.35, (SELECT id FROM hotel WHERE name = 'Furama Resort Danang' LIMIT 1)),
('1505', 'STANDARD', 'AVAILABLE', 5500000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.2, (SELECT id FROM hotel WHERE name = 'Furama Resort Danang' LIMIT 1)),

-- Rooms for A La Carte Danang Beach
('1601', 'DELUXE', 'AVAILABLE', 3200000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.15, (SELECT id FROM hotel WHERE name = 'A La Carte Danang Beach' LIMIT 1)),
('1602', 'SUITE', 'AVAILABLE', 4000000, 4, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.2, (SELECT id FROM hotel WHERE name = 'A La Carte Danang Beach' LIMIT 1)),
('1603', 'EXECUTIVE', 'AVAILABLE', 3600000, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.18, (SELECT id FROM hotel WHERE name = 'A La Carte Danang Beach' LIMIT 1)),
('1604', 'STANDARD', 'AVAILABLE', 2800000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.1, (SELECT id FROM hotel WHERE name = 'A La Carte Danang Beach' LIMIT 1)),
('1605', 'FAMILY', 'AVAILABLE', 4200000, 4, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.22, (SELECT id FROM hotel WHERE name = 'A La Carte Danang Beach' LIMIT 1)),

-- Rooms for Brilliant Hotel
('1701', 'STANDARD', 'AVAILABLE', 1200000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Brilliant Hotel' LIMIT 1)),
('1702', 'STANDARD', 'AVAILABLE', 1300000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.05, (SELECT id FROM hotel WHERE name = 'Brilliant Hotel' LIMIT 1)),
('1703', 'DELUXE', 'AVAILABLE', 1600000, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.1, (SELECT id FROM hotel WHERE name = 'Brilliant Hotel' LIMIT 1)),
('1704', 'FAMILY', 'AVAILABLE', 2000000, 4, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.12, (SELECT id FROM hotel WHERE name = 'Brilliant Hotel' LIMIT 1)),

-- Rooms for Golden Bay Hotel
('1801', 'DELUXE', 'AVAILABLE', 2400000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.12, (SELECT id FROM hotel WHERE name = 'Golden Bay Hotel' LIMIT 1)),
('1802', 'SUITE', 'AVAILABLE', 3000000, 4, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.15, (SELECT id FROM hotel WHERE name = 'Golden Bay Hotel' LIMIT 1)),
('1803', 'EXECUTIVE', 'AVAILABLE', 2700000, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.13, (SELECT id FROM hotel WHERE name = 'Golden Bay Hotel' LIMIT 1)),
('1804', 'STANDARD', 'AVAILABLE', 2000000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Golden Bay Hotel' LIMIT 1)),
('1805', 'FAMILY', 'AVAILABLE', 3200000, 4, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.18, (SELECT id FROM hotel WHERE name = 'Golden Bay Hotel' LIMIT 1)),

-- Rooms for Seaside Hotel
('1901', 'STANDARD', 'AVAILABLE', 1000000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Seaside Hotel' LIMIT 1)),
('1902', 'STANDARD', 'AVAILABLE', 1100000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.05, (SELECT id FROM hotel WHERE name = 'Seaside Hotel' LIMIT 1)),
('1903', 'DELUXE', 'AVAILABLE', 1400000, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.1, (SELECT id FROM hotel WHERE name = 'Seaside Hotel' LIMIT 1)),
('1904', 'FAMILY', 'AVAILABLE', 1800000, 4, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.12, (SELECT id FROM hotel WHERE name = 'Seaside Hotel' LIMIT 1)),

-- Rooms for Ocean Villa Hotel
('2001', 'DELUXE', 'AVAILABLE', 2600000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.14, (SELECT id FROM hotel WHERE name = 'Ocean Villa Hotel' LIMIT 1)),
('2002', 'SUITE', 'AVAILABLE', 3200000, 4, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.16, (SELECT id FROM hotel WHERE name = 'Ocean Villa Hotel' LIMIT 1)),
('2003', 'EXECUTIVE', 'AVAILABLE', 2900000, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.15, (SELECT id FROM hotel WHERE name = 'Ocean Villa Hotel' LIMIT 1)),
('2004', 'STANDARD', 'AVAILABLE', 2200000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.08, (SELECT id FROM hotel WHERE name = 'Ocean Villa Hotel' LIMIT 1)),
('2005', 'FAMILY', 'AVAILABLE', 3400000, 4, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.18, (SELECT id FROM hotel WHERE name = 'Ocean Villa Hotel' LIMIT 1)),

-- Rooms for Sunny Beach Hotel
('2101', 'STANDARD', 'AVAILABLE', 800000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Sunny Beach Hotel' LIMIT 1)),
('2102', 'STANDARD', 'AVAILABLE', 850000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Sunny Beach Hotel' LIMIT 1)),
('2103', 'DELUXE', 'AVAILABLE', 1200000, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.1, (SELECT id FROM hotel WHERE name = 'Sunny Beach Hotel' LIMIT 1)),
('2104', 'FAMILY', 'AVAILABLE', 1500000, 4, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.12, (SELECT id FROM hotel WHERE name = 'Sunny Beach Hotel' LIMIT 1)),

-- Rooms for hotels ở các thành phố khác
-- Hanoi Grand Hotel
('2201', 'SUITE', 'AVAILABLE', 4500000, 4, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.15, (SELECT id FROM hotel WHERE name = 'Hanoi Grand Hotel' LIMIT 1)),
('2202', 'DELUXE', 'AVAILABLE', 3500000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.1, (SELECT id FROM hotel WHERE name = 'Hanoi Grand Hotel' LIMIT 1)),
('2203', 'EXECUTIVE', 'AVAILABLE', 4000000, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.12, (SELECT id FROM hotel WHERE name = 'Hanoi Grand Hotel' LIMIT 1)),
-- Sofitel Legend Metropole
('2301', 'SUITE', 'AVAILABLE', 5000000, 4, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.2, (SELECT id FROM hotel WHERE name = 'Sofitel Legend Metropole' LIMIT 1)),
('2302', 'DELUXE', 'AVAILABLE', 4000000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.15, (SELECT id FROM hotel WHERE name = 'Sofitel Legend Metropole' LIMIT 1)),
-- Rex Hotel Saigon
('2401', 'DELUXE', 'AVAILABLE', 3200000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.1, (SELECT id FROM hotel WHERE name = 'Rex Hotel Saigon' LIMIT 1)),
('2402', 'SUITE', 'AVAILABLE', 4000000, 4, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.15, (SELECT id FROM hotel WHERE name = 'Rex Hotel Saigon' LIMIT 1)),
('2403', 'STANDARD', 'AVAILABLE', 2500000, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Rex Hotel Saigon' LIMIT 1)),
-- Park Hyatt Saigon
('2501', 'SUITE', 'AVAILABLE', 6000000, 4, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.25, (SELECT id FROM hotel WHERE name = 'Park Hyatt Saigon' LIMIT 1)),
('2502', 'EXECUTIVE', 'AVAILABLE', 5500000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.2, (SELECT id FROM hotel WHERE name = 'Park Hyatt Saigon' LIMIT 1)),
('2503', 'DELUXE', 'AVAILABLE', 5000000, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.18, (SELECT id FROM hotel WHERE name = 'Park Hyatt Saigon' LIMIT 1)),
-- Vinpearl Resort Nha Trang
('2601', 'SUITE', 'AVAILABLE', 5500000, 4, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.3, (SELECT id FROM hotel WHERE name = 'Vinpearl Resort Nha Trang' LIMIT 1)),
('2602', 'DELUXE', 'AVAILABLE', 4500000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.25, (SELECT id FROM hotel WHERE name = 'Vinpearl Resort Nha Trang' LIMIT 1)),
('2603', 'FAMILY', 'AVAILABLE', 6000000, 4, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.3, (SELECT id FROM hotel WHERE name = 'Vinpearl Resort Nha Trang' LIMIT 1)),
-- InterContinental Nha Trang
('2701', 'SUITE', 'AVAILABLE', 5000000, 4, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.2, (SELECT id FROM hotel WHERE name = 'InterContinental Nha Trang' LIMIT 1)),
('2702', 'DELUXE', 'AVAILABLE', 4000000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.15, (SELECT id FROM hotel WHERE name = 'InterContinental Nha Trang' LIMIT 1)),
-- Anantara Hoi An Resort
('2801', 'SUITE', 'AVAILABLE', 4800000, 4, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.22, (SELECT id FROM hotel WHERE name = 'Anantara Hoi An Resort' LIMIT 1)),
('2802', 'DELUXE', 'AVAILABLE', 3800000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.18, (SELECT id FROM hotel WHERE name = 'Anantara Hoi An Resort' LIMIT 1)),
('2803', 'FAMILY', 'AVAILABLE', 5200000, 4, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.25, (SELECT id FROM hotel WHERE name = 'Anantara Hoi An Resort' LIMIT 1)),
-- Imperial Hotel Hue
('2901', 'DELUXE', 'AVAILABLE', 3000000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.12, (SELECT id FROM hotel WHERE name = 'Imperial Hotel Hue' LIMIT 1)),
('2902', 'SUITE', 'AVAILABLE', 3800000, 4, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.15, (SELECT id FROM hotel WHERE name = 'Imperial Hotel Hue' LIMIT 1)),
('2903', 'STANDARD', 'AVAILABLE', 2500000, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Imperial Hotel Hue' LIMIT 1))
ON DUPLICATE KEY UPDATE Number=VALUES(Number);

-- Thêm nhiều hotels hơn ở các thành phố khác để test đầy đủ
INSERT INTO hotel (name, address, city, phone, description, image, rating, status, owner_user) VALUES
-- Hà Nội - thêm hotels
('Hanoi Opera Hotel', '29 Tràng Tiền, Hoàn Kiếm', 'Hà Nội', '0241234570', 'Khách sạn 4 sao gần Nhà hát Lớn', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 4, 'success', (SELECT id FROM users WHERE username = 'owner2' LIMIT 1)),
('Hanoi Garden Hotel', '78 Phố Hàng Bông, Hoàn Kiếm', 'Hà Nội', '0241234571', 'Khách sạn 3 sao gần phố cổ', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', 3, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1)),
('Hanoi Capital Hotel', '12 Lý Thái Tổ, Hoàn Kiếm', 'Hà Nội', '0241234572', 'Khách sạn 4 sao view Hồ Gươm', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 4, 'success', (SELECT id FROM users WHERE username = 'owner2' LIMIT 1)),
-- Hồ Chí Minh - thêm hotels
('Caravelle Saigon', '19 Công Trường Lam Sơn, Quận 1', 'Hồ Chí Minh', '0281234570', 'Khách sạn 5 sao lịch sử ở trung tâm', 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', 5, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1)),
('Majestic Saigon Hotel', '1 Đồng Khởi, Quận 1', 'Hồ Chí Minh', '0281234571', 'Khách sạn 4 sao ven sông Sài Gòn', 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', 4, 'success', (SELECT id FROM users WHERE username = 'owner2' LIMIT 1)),
('Liberty Central Saigon', '265 Phạm Ngũ Lão, Quận 1', 'Hồ Chí Minh', '0281234572', 'Khách sạn 3 sao gần phố Tây Bùi Viện', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', 3, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1)),
('Sheraton Saigon', '88 Đồng Khởi, Quận 1', 'Hồ Chí Minh', '0281234573', 'Khách sạn 5 sao sang trọng', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', 5, 'success', (SELECT id FROM users WHERE username = 'owner2' LIMIT 1)),
-- Nha Trang - thêm hotels
('Sheraton Nha Trang', '26-28 Trần Phú, Nha Trang', 'Nha Trang', '0258123459', 'Khách sạn 5 sao ven biển', 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800', 5, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1)),
('Amanoi Resort', 'Vịnh Vĩnh Hy, Nha Trang', 'Nha Trang', '0258123460', 'Resort 5 sao cao cấp với spa', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', 5, 'success', (SELECT id FROM users WHERE username = 'owner2' LIMIT 1)),
('Mia Resort Nha Trang', 'Bãi Dài, Cam Ranh', 'Nha Trang', '0258123461', 'Resort 4 sao với bãi biển riêng', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', 4, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1)),
-- Hội An - thêm hotels
('Four Seasons Resort Hoi An', 'Bãi Bắc, Cửa Đại', 'Hội An', '0235123458', 'Resort 5 sao sang trọng ven biển', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 5, 'success', (SELECT id FROM users WHERE username = 'owner2' LIMIT 1)),
('Palm Garden Beach Resort', 'Lạc Long Quân, Cửa Đại', 'Hội An', '0235123459', 'Resort 4 sao với hồ bơi lớn', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 4, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1)),
('Hoi An Riverside Resort', 'Cẩm Nam, Hội An', 'Hội An', '0235123460', 'Resort 4 sao bên sông Thu Bồn', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', 4, 'success', (SELECT id FROM users WHERE username = 'owner2' LIMIT 1)),
-- Huế - thêm hotels
('La Residence Hue', '5 Lê Lợi, Huế', 'Huế', '0234123458', 'Khách sạn 4 sao với kiến trúc Art Deco', 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', 4, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1)),
('Azerai La Residence', '5 Lê Lợi, Huế', 'Huế', '0234123459', 'Khách sạn boutique 4 sao ven sông Hương', 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', 4, 'success', (SELECT id FROM users WHERE username = 'owner2' LIMIT 1)),
('Moonlight Hotel Hue', '20 Phạm Ngũ Lão, Huế', 'Huế', '0234123460', 'Khách sạn 3 sao gần trung tâm', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', 3, 'success', (SELECT id FROM users WHERE username = 'owner1' LIMIT 1))
ON DUPLICATE KEY UPDATE name=VALUES(name), address=VALUES(address), city=VALUES(city), phone=VALUES(phone), description=VALUES(description), image=VALUES(image), rating=VALUES(rating), status=VALUES(status);

-- Thêm rooms cho các hotels mới
INSERT INTO rooms (Number, type, status, price, capacity, image, discount_percent, hotel_id) VALUES
-- Hanoi Opera Hotel
('3001', 'DELUXE', 'AVAILABLE', 3200000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.1, (SELECT id FROM hotel WHERE name = 'Hanoi Opera Hotel' LIMIT 1)),
('3002', 'SUITE', 'AVAILABLE', 4200000, 4, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.15, (SELECT id FROM hotel WHERE name = 'Hanoi Opera Hotel' LIMIT 1)),
('3003', 'STANDARD', 'AVAILABLE', 2800000, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Hanoi Opera Hotel' LIMIT 1)),
-- Hanoi Garden Hotel
('3101', 'STANDARD', 'AVAILABLE', 1500000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Hanoi Garden Hotel' LIMIT 1)),
('3102', 'DELUXE', 'AVAILABLE', 2000000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.1, (SELECT id FROM hotel WHERE name = 'Hanoi Garden Hotel' LIMIT 1)),
('3103', 'FAMILY', 'AVAILABLE', 2500000, 4, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.12, (SELECT id FROM hotel WHERE name = 'Hanoi Garden Hotel' LIMIT 1)),
-- Hanoi Capital Hotel
('3201', 'DELUXE', 'AVAILABLE', 3000000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.12, (SELECT id FROM hotel WHERE name = 'Hanoi Capital Hotel' LIMIT 1)),
('3202', 'EXECUTIVE', 'AVAILABLE', 3800000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.15, (SELECT id FROM hotel WHERE name = 'Hanoi Capital Hotel' LIMIT 1)),
('3203', 'SUITE', 'AVAILABLE', 4500000, 4, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.18, (SELECT id FROM hotel WHERE name = 'Hanoi Capital Hotel' LIMIT 1)),
-- Caravelle Saigon
('3301', 'SUITE', 'AVAILABLE', 5500000, 4, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.2, (SELECT id FROM hotel WHERE name = 'Caravelle Saigon' LIMIT 1)),
('3302', 'EXECUTIVE', 'AVAILABLE', 5000000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.18, (SELECT id FROM hotel WHERE name = 'Caravelle Saigon' LIMIT 1)),
('3303', 'DELUXE', 'AVAILABLE', 4500000, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.15, (SELECT id FROM hotel WHERE name = 'Caravelle Saigon' LIMIT 1)),
-- Majestic Saigon Hotel
('3401', 'DELUXE', 'AVAILABLE', 3500000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.12, (SELECT id FROM hotel WHERE name = 'Majestic Saigon Hotel' LIMIT 1)),
('3402', 'SUITE', 'AVAILABLE', 4500000, 4, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.18, (SELECT id FROM hotel WHERE name = 'Majestic Saigon Hotel' LIMIT 1)),
('3403', 'STANDARD', 'AVAILABLE', 3000000, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Majestic Saigon Hotel' LIMIT 1)),
-- Liberty Central Saigon
('3501', 'STANDARD', 'AVAILABLE', 1800000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Liberty Central Saigon' LIMIT 1)),
('3502', 'DELUXE', 'AVAILABLE', 2200000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.1, (SELECT id FROM hotel WHERE name = 'Liberty Central Saigon' LIMIT 1)),
('3503', 'FAMILY', 'AVAILABLE', 2800000, 4, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.12, (SELECT id FROM hotel WHERE name = 'Liberty Central Saigon' LIMIT 1)),
-- Sheraton Saigon
('3601', 'SUITE', 'AVAILABLE', 6500000, 4, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.25, (SELECT id FROM hotel WHERE name = 'Sheraton Saigon' LIMIT 1)),
('3602', 'EXECUTIVE', 'AVAILABLE', 6000000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.22, (SELECT id FROM hotel WHERE name = 'Sheraton Saigon' LIMIT 1)),
('3603', 'DELUXE', 'AVAILABLE', 5500000, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.2, (SELECT id FROM hotel WHERE name = 'Sheraton Saigon' LIMIT 1)),
-- Sheraton Nha Trang
('3701', 'SUITE', 'AVAILABLE', 5200000, 4, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.22, (SELECT id FROM hotel WHERE name = 'Sheraton Nha Trang' LIMIT 1)),
('3702', 'DELUXE', 'AVAILABLE', 4200000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.18, (SELECT id FROM hotel WHERE name = 'Sheraton Nha Trang' LIMIT 1)),
('3703', 'FAMILY', 'AVAILABLE', 5800000, 4, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.25, (SELECT id FROM hotel WHERE name = 'Sheraton Nha Trang' LIMIT 1)),
-- Amanoi Resort
('3801', 'SUITE', 'AVAILABLE', 8000000, 4, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.3, (SELECT id FROM hotel WHERE name = 'Amanoi Resort' LIMIT 1)),
('3802', 'EXECUTIVE', 'AVAILABLE', 7500000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.28, (SELECT id FROM hotel WHERE name = 'Amanoi Resort' LIMIT 1)),
('3803', 'DELUXE', 'AVAILABLE', 7000000, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.25, (SELECT id FROM hotel WHERE name = 'Amanoi Resort' LIMIT 1)),
-- Mia Resort Nha Trang
('3901', 'SUITE', 'AVAILABLE', 4800000, 4, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.2, (SELECT id FROM hotel WHERE name = 'Mia Resort Nha Trang' LIMIT 1)),
('3902', 'DELUXE', 'AVAILABLE', 3800000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.15, (SELECT id FROM hotel WHERE name = 'Mia Resort Nha Trang' LIMIT 1)),
('3903', 'FAMILY', 'AVAILABLE', 5200000, 4, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.22, (SELECT id FROM hotel WHERE name = 'Mia Resort Nha Trang' LIMIT 1)),
-- Four Seasons Resort Hoi An
('4001', 'SUITE', 'AVAILABLE', 7500000, 4, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.3, (SELECT id FROM hotel WHERE name = 'Four Seasons Resort Hoi An' LIMIT 1)),
('4002', 'EXECUTIVE', 'AVAILABLE', 7000000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.28, (SELECT id FROM hotel WHERE name = 'Four Seasons Resort Hoi An' LIMIT 1)),
('4003', 'DELUXE', 'AVAILABLE', 6500000, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.25, (SELECT id FROM hotel WHERE name = 'Four Seasons Resort Hoi An' LIMIT 1)),
-- Palm Garden Beach Resort
('4101', 'SUITE', 'AVAILABLE', 4500000, 4, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.18, (SELECT id FROM hotel WHERE name = 'Palm Garden Beach Resort' LIMIT 1)),
('4102', 'DELUXE', 'AVAILABLE', 3500000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.15, (SELECT id FROM hotel WHERE name = 'Palm Garden Beach Resort' LIMIT 1)),
('4103', 'FAMILY', 'AVAILABLE', 4800000, 4, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.2, (SELECT id FROM hotel WHERE name = 'Palm Garden Beach Resort' LIMIT 1)),
-- Hoi An Riverside Resort
('4201', 'DELUXE', 'AVAILABLE', 4000000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.16, (SELECT id FROM hotel WHERE name = 'Hoi An Riverside Resort' LIMIT 1)),
('4202', 'SUITE', 'AVAILABLE', 5000000, 4, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.2, (SELECT id FROM hotel WHERE name = 'Hoi An Riverside Resort' LIMIT 1)),
('4203', 'STANDARD', 'AVAILABLE', 3200000, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Hoi An Riverside Resort' LIMIT 1)),
-- La Residence Hue
('4301', 'DELUXE', 'AVAILABLE', 3500000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.14, (SELECT id FROM hotel WHERE name = 'La Residence Hue' LIMIT 1)),
('4302', 'SUITE', 'AVAILABLE', 4500000, 4, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.18, (SELECT id FROM hotel WHERE name = 'La Residence Hue' LIMIT 1)),
('4303', 'EXECUTIVE', 'AVAILABLE', 4000000, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.16, (SELECT id FROM hotel WHERE name = 'La Residence Hue' LIMIT 1)),
-- Azerai La Residence
('4401', 'SUITE', 'AVAILABLE', 4800000, 4, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.2, (SELECT id FROM hotel WHERE name = 'Azerai La Residence' LIMIT 1)),
('4402', 'DELUXE', 'AVAILABLE', 3800000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.16, (SELECT id FROM hotel WHERE name = 'Azerai La Residence' LIMIT 1)),
('4403', 'STANDARD', 'AVAILABLE', 3000000, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Azerai La Residence' LIMIT 1)),
-- Moonlight Hotel Hue
('4501', 'STANDARD', 'AVAILABLE', 1800000, 2, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', 0.0, (SELECT id FROM hotel WHERE name = 'Moonlight Hotel Hue' LIMIT 1)),
('4502', 'DELUXE', 'AVAILABLE', 2200000, 2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400', 0.1, (SELECT id FROM hotel WHERE name = 'Moonlight Hotel Hue' LIMIT 1)),
('4503', 'FAMILY', 'AVAILABLE', 2800000, 4, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 0.12, (SELECT id FROM hotel WHERE name = 'Moonlight Hotel Hue' LIMIT 1))
ON DUPLICATE KEY UPDATE Number=VALUES(Number);

-- Thêm bookings với các ngày khác nhau để test availability
INSERT INTO booking (status, booking_date, check_in_date, check_out_date, total_price, user_id, hotel_id, rooms_id) VALUES
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
('PENDING', NOW(), DATE_ADD(NOW(), INTERVAL 14 DAY), DATE_ADD(NOW(), INTERVAL 17 DAY), 3600000, (SELECT id FROM users WHERE username = 'user2' LIMIT 1), (SELECT id FROM hotel WHERE name = 'La Residence Hue' LIMIT 1), (SELECT id FROM rooms WHERE Number = '4301' AND hotel_id = (SELECT id FROM hotel WHERE name = 'La Residence Hue' LIMIT 1) LIMIT 1))
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- Thêm reviews cho các hotels mới
INSERT INTO hotel_reviews (rating, comment, hotel_id, user_id) VALUES
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
(3, 'Giá rẻ, gần trung tâm. Phù hợp cho ngân sách hạn chế.', (SELECT id FROM hotel WHERE name = 'Moonlight Hotel Hue' LIMIT 1), (SELECT id FROM users WHERE username = 'user1' LIMIT 1))
ON DUPLICATE KEY UPDATE comment=VALUES(comment);
-- Company Info
INSERT INTO company_info (`key`, `value`) VALUES
('name', 'Hotels Booking'),
('founded', '2010'),
('mission', 'Mang đến trải nghiệm đặt phòng khách sạn tốt nhất cho khách hàng với giá cả hợp lý, dịch vụ chất lượng và hỗ trợ 24/7.'),
('vision', 'Trở thành nền tảng đặt phòng khách sạn hàng đầu tại Việt Nam và khu vực Đông Nam Á.')
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

-- FAQs
INSERT INTO faq (question, answer, display_order) VALUES
('Làm thế nào để đặt phòng?', 'Bạn có thể đặt phòng bằng cách tìm kiếm khách sạn trên trang chủ, chọn ngày nhận phòng và trả phòng, sau đó chọn phòng phù hợp và thanh toán.', 1),
('Tôi có thể hủy đặt phòng không?', 'Có, bạn có thể hủy đặt phòng trong vòng 24 giờ trước ngày nhận phòng. Vui lòng kiểm tra chính sách hủy của từng khách sạn.', 2),
('Phương thức thanh toán nào được chấp nhận?', 'Chúng tôi chấp nhận thanh toán bằng thẻ tín dụng, thẻ ghi nợ, chuyển khoản ngân hàng và các ví điện tử phổ biến.', 3),
('Làm sao để liên hệ hỗ trợ khách hàng?', 'Bạn có thể liên hệ chúng tôi qua email support@hotelsbooking.com, hotline +84 123 456 789 hoặc sử dụng chatbox trên website. Chúng tôi hỗ trợ 24/7.', 4),
('Có phí ẩn nào không?', 'Không, chúng tôi minh bạch về giá cả. Tất cả các khoản phí đều được hiển thị rõ ràng trước khi bạn xác nhận đặt phòng.', 5)
ON DUPLICATE KEY UPDATE question = VALUES(question), answer = VALUES(answer);

-- Contact Info
INSERT INTO contact_info (type, title, content, link, display_order) VALUES
('email', 'Email', 'support@hotelsbooking.com', 'mailto:support@hotelsbooking.com', 1),
('phone', 'Điện thoại', '+84 123 456 789', 'tel:+84123456789', 2),
('address', 'Địa chỉ', '123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh, Việt Nam', 'https://maps.google.com', 3),
('hours', 'Giờ làm việc', '24/7 - Hỗ trợ mọi lúc', '#', 4)
ON DUPLICATE KEY UPDATE title = VALUES(title), content = VALUES(content), link = VALUES(link);

-- Offices
INSERT INTO office (name, address, phone, email, hours, latitude, longitude, display_order) VALUES
('Trụ sở chính - TP. Hồ Chí Minh', '123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh', '+84 123 456 789', 'hcm@hotelsbooking.com', 'Thứ 2 - Chủ nhật: 8:00 - 20:00', 10.8231, 106.6297, 1),
('Văn phòng Hà Nội', '456 Đường DEF, Quận GHI, Hà Nội', '+84 987 654 321', 'hanoi@hotelsbooking.com', 'Thứ 2 - Chủ nhật: 8:00 - 20:00', 21.0285, 105.8542, 2),
('Văn phòng Đà Nẵng', '789 Đường JKL, Quận MNO, Đà Nẵng', '+84 555 123 456', 'danang@hotelsbooking.com', 'Thứ 2 - Chủ nhật: 8:00 - 20:00', 16.0544, 108.2022, 3)
ON DUPLICATE KEY UPDATE name = VALUES(name), address = VALUES(address), phone = VALUES(phone), email = VALUES(email);

-- ============================================
-- COMPLETE!
-- ============================================
SELECT '✅ Database setup hoàn tất! Tất cả bảng và dữ liệu đã được tạo.' AS message;

