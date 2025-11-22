-- ============================================
-- SCRIPT XÓA DUPLICATE HOTELS
-- Chạy script này để xóa các hotels bị duplicate
-- ============================================

-- Set UTF-8 encoding
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET character_set_connection = utf8mb4;

-- Xóa duplicate hotels (giữ lại bản có ID nhỏ nhất dựa trên name và owner_user)
-- Logic: Nếu có nhiều hotels cùng tên và cùng owner_user, giữ lại bản có ID nhỏ nhất
DELETE h1 FROM hotel h1
INNER JOIN hotel h2 
ON h1.name = h2.name 
AND h1.owner_user = h2.owner_user
AND h1.deleted = h2.deleted
WHERE h1.id > h2.id;

-- Hiển thị kết quả
SELECT 
    '✅ Đã xóa duplicate hotels thành công!' AS message,
    COUNT(*) AS total_hotels_remaining
FROM hotel 
WHERE deleted = FALSE;

